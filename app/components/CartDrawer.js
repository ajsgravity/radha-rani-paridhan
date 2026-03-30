'use client'

import { useCart } from '../context/CartContext'
import Link from 'next/link'
import Image from 'next/image'

export default function CartDrawer() {
  const { items, removeItem, updateQty, drawerOpen, setDrawerOpen, totalItems, totalPrice } = useCart()

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            backdropFilter: 'blur(3px)', zIndex: 900, transition: 'opacity .3s',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: 420,
        height: '100vh', background: '#111', borderLeft: '1px solid #2a2a2a',
        zIndex: 901, transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #2a2a2a',
        }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: '#f0ede8' }}>
            Your Cart <span style={{ color: '#d4a853', fontSize: '.85rem' }}>({totalItems})</span>
          </h2>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: 'none', border: 'none', color: '#888', fontSize: '1.4rem',
              cursor: 'pointer', padding: '4px 8px',
            }}
          >✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🛒</div>
              <p style={{ color: '#888', fontSize: '.9rem' }}>Your cart is empty</p>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  marginTop: 20, background: 'none', border: '1px solid #444',
                  borderRadius: 100, padding: '10px 24px', color: '#ccc',
                  fontSize: '.82rem', cursor: 'pointer',
                }}
              >Continue Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map(item => (
                <div key={item.slug} style={{
                  display: 'flex', gap: 16, padding: '16px',
                  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                    flexShrink: 0, background: '#222',
                  }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={160}
                      height={160}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#eee', marginBottom: 4 }}>
                      {item.name}
                    </div>
                    <div style={{ color: '#d4a853', fontWeight: 600, fontSize: '.85rem', marginBottom: 10 }}>
                      {item.price}
                    </div>

                    {/* Qty Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <button
                        onClick={() => updateQty(item.slug, item.qty - 1)}
                        style={{
                          background: '#222', border: '1px solid #444', borderRadius: '6px 0 0 6px',
                          color: '#ccc', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
                        }}
                      >−</button>
                      <div style={{
                        background: '#1a1a1a', borderTop: '1px solid #444', borderBottom: '1px solid #444',
                        width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.85rem', color: '#eee',
                      }}>{item.qty}</div>
                      <button
                        onClick={() => updateQty(item.slug, item.qty + 1)}
                        style={{
                          background: '#222', border: '1px solid #444', borderRadius: '0 6px 6px 0',
                          color: '#ccc', width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
                        }}
                      >+</button>

                      <button
                        onClick={() => removeItem(item.slug)}
                        style={{
                          background: 'none', border: 'none', color: '#ff6b6b',
                          fontSize: '.75rem', cursor: 'pointer', marginLeft: 'auto',
                        }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px', borderTop: '1px solid #2a2a2a',
            background: '#0d0d0d',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16,
            }}>
              <span style={{ color: '#aaa', fontSize: '.85rem' }}>Subtotal</span>
              <span style={{ color: '#d4a853', fontWeight: 700, fontSize: '1.1rem' }}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                background: '#d4a853', color: '#080808', borderRadius: 100,
                padding: '14px 0', fontSize: '.9rem', fontWeight: 700,
                width: '100%',
              }}
            >
              Proceed to Checkout →
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                display: 'block', width: '100%', marginTop: 10,
                background: 'none', border: '1px solid #333', borderRadius: 100,
                padding: '12px 0', color: '#aaa', fontSize: '.82rem', cursor: 'pointer',
              }}
            >Continue Shopping</button>
          </div>
        )}
      </div>
    </>
  )
}
