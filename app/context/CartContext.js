'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext()

// Safe price parser — handles both "₹12,999" and numeric 12999
function parsePriceToNumber(price) {
  if (typeof price === 'number') return price
  if (typeof price === 'string') {
    return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0
  }
  return 0
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rr_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist cart to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem('rr_cart', JSON.stringify(items))
    } catch { /* ignore */ }
  }, [items, hydrated])

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.slug === product.slug)
      if (existing) {
        return prev.map(i => i.slug === product.slug ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setDrawerOpen(true)
  }, [])

  const removeItem = useCallback((slug) => {
    setItems(prev => prev.filter(i => i.slug !== slug))
  }, [])

  const updateQty = useCallback((slug, qty) => {
    if (qty < 1) return removeItem(slug)
    setItems(prev => prev.map(i => i.slug === slug ? { ...i, qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const totalPrice = items.reduce((s, i) => s + parsePriceToNumber(i.price) * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      drawerOpen, setDrawerOpen, totalItems, totalPrice,
      parsePriceToNumber,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
