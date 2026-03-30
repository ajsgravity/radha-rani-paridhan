'use client'

import { useCart } from '../context/CartContext'

export default function CartIcon() {
  const { totalItems, setDrawerOpen } = useCart()

  return (
    <button
      onClick={() => setDrawerOpen(true)}
      aria-label="Open cart"
      style={{
        position: 'relative', background: 'none', border: 'none',
        cursor: 'pointer', padding: '4px', fontSize: '1.3rem', color: '#f0ede8',
      }}
    >
      🛒
      {totalItems > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -6,
          background: '#d4a853', color: '#080808',
          borderRadius: '50%', width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.65rem', fontWeight: 800,
        }}>
          {totalItems}
        </span>
      )}
    </button>
  )
}
