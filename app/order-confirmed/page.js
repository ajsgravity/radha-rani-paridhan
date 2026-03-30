import Link from 'next/link'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Order Confirmed — Radha Rani Paridhan Ajmer',
}

export default async function OrderConfirmedPage({ searchParams }) {
  const params = await searchParams
  const orderId = params?.id || ''

  return (
    <>
      <Ticker />
      <Navbar />
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080808', padding: '60px 24px',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: 480,
          animation: 'fade-up 0.5s ease both',
        }}>
          {/* WhatsApp checkmark */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(37,211,102,.12)', border: '2px solid rgba(37,211,102,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', fontSize: '2.2rem',
          }}>
            ✅
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.8rem',
            fontWeight: 700, marginBottom: 12,
          }}>
            Order Confirmed!
          </h1>

          {orderId && (
            <div style={{
              display: 'inline-block', background: 'rgba(212,168,83,.1)',
              border: '1px solid rgba(212,168,83,.25)', borderRadius: 8,
              padding: '6px 18px', fontSize: '.8rem', color: '#d4a853',
              fontFamily: 'monospace', fontWeight: 700, marginBottom: 20, letterSpacing: '.05em',
            }}>
              Order #{orderId}
            </div>
          )}

          <p style={{ color: '#aaa', fontSize: '.9rem', lineHeight: 1.8, marginBottom: 12 }}>
            Your order has been saved. WhatsApp should have opened — please <strong style={{ color: '#f0ede8' }}>send the message</strong> to confirm your order with us directly.
          </p>

          <p style={{ color: '#555', fontSize: '.8rem', lineHeight: 1.7, marginBottom: 36 }}>
            If WhatsApp didn&apos;t open automatically,{' '}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#25D366', textDecoration: 'underline' }}
            >
              click here to open WhatsApp
            </a>.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/collections" style={{
              display: 'inline-block', textDecoration: 'none',
              border: '1px solid #333', color: '#aaa',
              borderRadius: 100, padding: '12px 28px', fontSize: '.85rem',
            }}>
              Continue Shopping
            </Link>
            <Link href="/" style={{
              display: 'inline-block', textDecoration: 'none',
              background: '#d4a853', color: '#080808',
              borderRadius: 100, padding: '12px 28px',
              fontSize: '.85rem', fontWeight: 700,
            }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
