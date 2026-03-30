'use client'

import { useCart } from '../context/CartContext'

export default function AddToCartButton({ product, variant = 'primary' }) {
  const { addItem } = useCart()

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  if (variant === 'small') {
    return (
      <button
        onClick={handleClick}
        style={{
          background: '#d4a853', color: '#080808', border: 'none',
          borderRadius: 100, padding: '8px 18px', fontSize: '.75rem',
          fontWeight: 700, cursor: 'pointer', marginTop: 8,
          transition: 'transform .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Add to Cart
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="btn-cart"
    >
      Add to Cart
    </button>
  )
}
