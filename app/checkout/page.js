'use client'

import { useCart } from '../context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const S = {
  page: { background: '#0d0d0d', minHeight: '100vh', color: '#f0ede8' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '40px 48px 80px' },
  heading: { fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: 24 },
  label: { fontSize: '.72rem', fontWeight: 600, color: '#999', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input: { background: '#111', border: '1px solid #333', borderRadius: 8, padding: '12px 14px', color: '#f0ede8', fontSize: '.85rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  goldBtn: { display: 'block', width: '100%', background: '#d4a853', color: '#080808', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', marginTop: 12 },
  goldBtnDisabled: { display: 'block', width: '100%', background: '#8a7a4a', color: '#080808', border: 'none', borderRadius: 100, padding: '14px 0', fontSize: '.9rem', fontWeight: 700, cursor: 'not-allowed', marginTop: 12, opacity: 0.7 },
  error: { color: '#ff6b6b', fontSize: '.78rem', marginTop: 6 },
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [placed, setPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pinCode: '',
  })

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  if (placed) {
    return (
      <>
        <Ticker />
        <Navbar />
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎉</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: 12 }}>
              Order Placed!
            </h1>
            <p style={{ color: '#aaa', fontSize: '.9rem', maxWidth: 400, margin: '0 auto 28px' }}>
              Thank you for shopping with Radha Rani Paridhan. You will receive a confirmation shortly.
            </p>
            <Link href="/" style={{
              display: 'inline-block', textDecoration: 'none', background: '#d4a853',
              color: '#080808', borderRadius: 100, padding: '12px 32px',
              fontSize: '.85rem', fontWeight: 700,
            }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </>
    )
  }

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
    // Basic validation
    if (!form.name || !form.email || !form.address1 || !form.city || !form.state || !form.pinCode) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const orderData = {
        items: items.map(i => ({
          name: i.name,
          slug: i.slug,
          price: parseInt(i.price.replace(/[^0-9]/g, ''), 10),
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
        throw new Error(data.error || 'Failed to place order')
      }

      setPlaced(true)
      clearCart()
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
                    <label style={S.label}>Phone</label>
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

              {/* Payment note */}
              <div style={{ ...S.card, borderColor: '#333' }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 12, paddingBottom: 14, borderBottom: '1px solid #2a2a2a' }}>
                  Payment
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#111', borderRadius: 8, border: '1px solid #2a2a2a' }}>
                  <span style={{ fontSize: '1.2rem' }}>💳</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '.85rem' }}>Cash on Delivery</div>
                    <div style={{ fontSize: '.75rem', color: '#888' }}>Pay when your order arrives</div>
                  </div>
                </div>
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

              {error && <div style={S.error}>{error}</div>}

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                style={loading ? S.goldBtnDisabled : S.goldBtn}
              >
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
              <Link href="/collections" style={{
                display: 'block', textAlign: 'center', marginTop: 10,
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
