'use client'

import { useCart } from '../context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ── Store owner's WhatsApp number (international format, no +) ──
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'

const S = {
  page: { background: '#0d0d0d', minHeight: '100vh', color: '#f0ede8' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 48px 80px' },
  heading: { fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24 },
  label: { fontSize: '.72rem', fontWeight: 600, color: '#999', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { background: '#111', border: '1px solid #333', borderRadius: 8, padding: '12px 14px', color: '#f0ede8', fontSize: '.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  whatsappBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: '#25D366', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', marginTop: 12, transition: 'opacity .2s' },
  whatsappBtnDisabled: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: '#1a9e4b', color: '#fff', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: '.9rem', fontWeight: 700, cursor: 'not-allowed', marginTop: 12, opacity: 0.6 },
  error: { color: '#ff6b6b', fontSize: '.78rem', marginTop: 6 },
}

// ── Build the WhatsApp pre-filled message ──────────────────────────
function buildWhatsAppMessage(form, items, totalPrice, orderId) {
  const itemLines = items.map(i => {
    const unitPrice = typeof i.price === 'number'
      ? i.price
      : parseInt(i.price.replace(/[^0-9]/g, ''), 10)
    return `  • ${i.name} x${i.qty} — ₹${(unitPrice * i.qty).toLocaleString('en-IN')}`
  }).join('\n')

  const msg = [
    `🛍️ *New Order — Radha Rani Paridhan Ajmer*`,
    `Order ID: #${orderId.slice(-6).toUpperCase()}`,
    ``,
    `*Customer Details*`,
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Email: ${form.email}`,
    ``,
    `*Shipping Address*`,
    `${form.address1}${form.address2 ? ', ' + form.address2 : ''}`,
    `${form.city}, ${form.state} — ${form.pinCode}, India`,
    ``,
    `*Order Items*`,
    itemLines,
    ``,
    `*Total: ₹${totalPrice.toLocaleString('en-IN')}*`,
    `Payment: Cash on Delivery`,
    ``,
    `Please confirm my order. Thank you! 🙏`,
  ].join('\n')

  return encodeURIComponent(msg)
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pinCode: '',
  })

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  if (!items || items.length === 0) {
    return (
      <>
        <Ticker />
        <Navbar />
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🛒</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: 12 }}>
              Your cart is empty
            </h1>
            <Link href="/collections" style={{
              display: 'inline-block', textDecoration: 'none', background: 'none',
              border: '1px solid #444', color: '#ccc', borderRadius: 100,
              padding: '10px 28px', fontSize: '.85rem',
            }}>
              Browse Collections →
            </Link>
          </div>
        </div>
      </>
    )
  }

  const handlePlaceOrder = async () => {
    if (!form.name || !form.email || !form.address1 || !form.city || !form.state || !form.pinCode) {
      setError('Please fill in all required fields.')
      return
    }
    if (!form.phone) {
      setError('Phone number is required for WhatsApp order confirmation.')
      return
    }
    setError('')
    setLoading(true)

    try {
      // 1️⃣ Save order to MongoDB
      const orderData = {
        items: items.map(i => ({
          name: i.name,
          slug: i.slug,
          price: typeof i.price === 'number' ? i.price : parseInt(i.price.replace(/[^0-9]/g, ''), 10),
          qty: i.qty,
          image: i.image,
        })),
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: {
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          pinCode: form.pinCode,
          country: 'India',
        },
        total: totalPrice,
        paymentMethod: 'cod',
      }

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save order')
      }

      const { data: savedOrder } = await res.json()

      // 2️⃣ Clear the cart
      clearCart()

      // 3️⃣ Open WhatsApp with pre-filled order message
      const message = buildWhatsAppMessage(form, items, totalPrice, savedOrder._id)
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
      window.open(waUrl, '_blank')

      // 4️⃣ Redirect to order confirmed page
      window.location.href = `/order-confirmed?id=${savedOrder._id.slice(-6).toUpperCase()}`
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Ticker />
      <Navbar />

      <div style={S.page}>
        <div style={S.container}>
          <h1 style={S.heading}>Checkout</h1>

          <div style={S.grid}>
            {/* LEFT: Form */}
            <div>
              {/* Contact */}
              <div style={{ ...S.card, marginBottom: 20 }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #2a2a2a' }}>
                  Contact Information
                </h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Full Name *</label>
                  <input style={S.input} placeholder="e.g. Priya Sharma" value={form.name} onChange={update('name')} />
                </div>
                <div style={S.row2}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>Email *</label>
                    <input style={S.input} placeholder="priya@example.com" type="email" value={form.email} onChange={update('email')} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>WhatsApp Phone *</label>
                    <input style={S.input} placeholder="+91 98765 43210" type="tel" value={form.phone} onChange={update('phone')} />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div style={{ ...S.card, marginBottom: 20 }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #2a2a2a' }}>
                  Shipping Address
                </h3>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Address Line 1 *</label>
                  <input style={S.input} placeholder="House no., Street name" value={form.address1} onChange={update('address1')} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Address Line 2</label>
                  <input style={S.input} placeholder="Apartment, building, floor (optional)" value={form.address2} onChange={update('address2')} />
                </div>
                <div style={S.row2}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>City *</label>
                    <input style={S.input} placeholder="e.g. Varanasi" value={form.city} onChange={update('city')} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>State *</label>
                    <input style={S.input} placeholder="e.g. Uttar Pradesh" value={form.state} onChange={update('state')} />
                  </div>
                </div>
                <div style={S.row2}>
                  <div>
                    <label style={S.label}>PIN Code *</label>
                    <input style={S.input} placeholder="221001" value={form.pinCode} onChange={update('pinCode')} />
                  </div>
                  <div>
                    <label style={S.label}>Country</label>
                    <input style={S.input} value="India" readOnly />
                  </div>
                </div>
              </div>

              {/* How it works */}
              <div style={{ ...S.card, borderColor: '#1a3a27' }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #1a3a27' }}>
                  How it works
                </h3>
                {[
                  { icon: '✅', text: 'Your order is saved in our system' },
                  { icon: '💬', text: 'WhatsApp opens with your full order summary' },
                  { icon: '📦', text: 'We confirm and dispatch your order' },
                  { icon: '🚚', text: 'Pay cash when it arrives at your door' },
                ].map(step => (
                  <div key={step.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: '.82rem', color: '#aaa' }}>
                    <span>{step.icon}</span>
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div style={{ ...S.card, position: 'sticky', top: 24 }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #2a2a2a' }}>
                Order Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {items.map(item => (
                  <div key={item.slug} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#222' }}>
                      <Image src={item.image} alt={item.name} width={112} height={112}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '.82rem', color: '#eee' }}>{item.name}</div>
                      <div style={{ fontSize: '.75rem', color: '#888' }}>Qty: {item.qty}</div>
                    </div>
                    <div style={{ color: '#d4a853', fontWeight: 600, fontSize: '.85rem', flexShrink: 0 }}>
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
                {[
                  { label: 'Subtotal', value: `₹${totalPrice.toLocaleString('en-IN')}` },
                  { label: 'Shipping', value: 'Free' },
                  { label: 'Tax (GST)', value: 'Included' },
                ].map(row => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 10, fontSize: '.82rem',
                  }}>
                    <span style={{ color: '#aaa' }}>{row.label}</span>
                    <span style={{ color: '#ccc' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderTop: '1px solid #2a2a2a', paddingTop: 14, marginTop: 8,
                }}>
                  <span style={{ fontWeight: 700, fontSize: '.9rem' }}>Total</span>
                  <span style={{ color: '#d4a853', fontWeight: 700, fontSize: '1.1rem' }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {error && <div style={S.error}>⚠ {error}</div>}

              <button
                id="whatsapp-checkout-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={loading ? S.whatsappBtnDisabled : S.whatsappBtn}
              >
                {/* WhatsApp icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {loading ? 'Saving Order...' : 'Order via WhatsApp →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '.7rem', color: '#555', marginTop: 10, lineHeight: 1.5 }}>
                Order saved instantly, then WhatsApp opens to confirm with us directly.
              </p>

              <Link href="/collections" style={{
                display: 'block', textAlign: 'center', marginTop: 8,
                color: '#aaa', fontSize: '.78rem', textDecoration: 'none',
              }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
