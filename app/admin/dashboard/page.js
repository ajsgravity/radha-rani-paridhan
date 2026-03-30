'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ── Auth Helper ─────────────────────────────────
function getToken() {
  try { return localStorage.getItem('rr_admin_token') } catch { return null }
}
function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
}

// ── API Helper ──────────────────────────────────
async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })
  if (res.status === 401) {
    localStorage.removeItem('rr_admin_token')
    window.location.href = '/admin'
    return null
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error || 'Request failed')
  return data
}

// ── Styles ──────────────────────────────────────
const S = {
  root: { display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh', background: '#080808', color: '#e8e4df', fontFamily: 'var(--font-sans)' },
  sidebar: { background: '#0c0c0c', borderRight: '1px solid #1e1e1e', padding: '0', display: 'flex', flexDirection: 'column', position: 'fixed', width: 240, height: '100vh', overflowY: 'auto' },
  sideTop: { padding: '28px 24px 20px', borderBottom: '1px solid #1e1e1e' },
  brand: { fontWeight: 700, fontSize: '.8rem', letterSpacing: '.12em', color: '#d4a853', marginBottom: 4 },
  brandSub: { fontSize: '.65rem', color: '#444', letterSpacing: '.05em' },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '11px 24px',
    fontSize: '.82rem', cursor: 'pointer', transition: 'all .2s',
    color: active ? '#d4a853' : '#666',
    borderLeft: active ? '2px solid #d4a853' : '2px solid transparent',
    background: active ? 'rgba(212,168,83,.06)' : 'transparent',
  }),
  main: { marginLeft: 240, padding: '40px 48px 80px', minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  heading: { fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14 },
  statCard: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: 24 },
  goldBtn: { background: '#d4a853', color: '#000', border: 'none', borderRadius: 100, padding: '10px 22px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity .2s' },
  dangerBtn: { background: '#2a1515', border: '1px solid #553333', borderRadius: 8, padding: '7px 14px', fontSize: '.75rem', color: '#ff6b6b', cursor: 'pointer' },
  ghostBtn: { background: 'transparent', border: '1px solid #333', borderRadius: 8, padding: '7px 14px', fontSize: '.75rem', color: '#aaa', cursor: 'pointer' },
  th: { fontSize: '.68rem', color: '#666', letterSpacing: '.06em', textTransform: 'uppercase', padding: '12px 20px', textAlign: 'left', borderBottom: '1px solid #1e1e1e', fontWeight: 600, background: '#0e0e0e' },
  td: { padding: '14px 20px', fontSize: '.82rem', borderBottom: '1px solid #161616', color: '#ddd' },
  input: { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '11px 14px', color: '#f0ede8', fontSize: '.85rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  label: { fontSize: '.68rem', fontWeight: 600, color: '#666', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 7 },
  badge: (cat) => {
    const colors = { Sarees: '#7c5c2e', Suits: '#2e5c4a', Lehengas: '#5c2e4a', Accessories: '#2e3f5c' }
    return {
      background: colors[cat] || '#2a2a2a', color: '#ddd',
      borderRadius: 6, padding: '3px 10px', fontSize: '.68rem', fontWeight: 600,
    }
  },
  statusPill: (s) => {
    const map = {
      pending: { bg: 'rgba(212,168,83,.15)', color: '#d4a853' },
      confirmed: { bg: 'rgba(99,199,119,.15)', color: '#63c777' },
      shipped: { bg: 'rgba(99,149,199,.15)', color: '#6395c7' },
      delivered: { bg: 'rgba(99,199,119,.2)', color: '#4bc76a' },
      cancelled: { bg: 'rgba(255,77,77,.15)', color: '#ff6b6b' },
    }
    const c = map[s] || map.pending
    return { background: c.bg, color: c.color, borderRadius: 100, padding: '3px 12px', fontSize: '.7rem', fontWeight: 700 }
  },
}

// ── Product Modal ────────────────────────────────
function ProductModal({ editProduct, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: editProduct?.name || '',
    category: editProduct?.category || 'Sarees',
    price: editProduct?.price || '',
    originalPrice: editProduct?.originalPrice || '',
    description: editProduct?.description || '',
    badge: editProduct?.badge || '',
    image: editProduct?.image || '',
    cloudinaryPublicId: editProduct?.cloudinaryPublicId || '',
    status: editProduct?.status !== undefined ? editProduct.status : true,
    specs: editProduct?.specs?.length ? editProduct.specs : [{ icon: '', label: '', value: '' }],
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const fileRef = useRef()

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_URL}/api/products/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm(prev => ({ ...prev, image: data.url, cloudinaryPublicId: data.publicId }))
    } catch (err) {
      setUploadErr(err.message)
    } finally {
      setUploading(false)
    }
  }

  function updateSpec(i, field, val) {
    setForm(prev => {
      const specs = [...prev.specs]
      specs[i] = { ...specs[i], [field]: val }
      return { ...prev, specs }
    })
  }
  function addSpec() {
    setForm(prev => ({ ...prev, specs: [...prev.specs, { icon: '', label: '', value: '' }] }))
  }
  function removeSpec(i) {
    setForm(prev => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }))
  }

  async function save() {
    if (!form.name) return alert('Product name is required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        specs: form.specs.filter(s => s.label),
      }
      let result
      if (editProduct) {
        result = await api(`/api/products/${editProduct._id}`, {
          method: 'PUT', body: JSON.stringify(payload),
        })
      } else {
        result = await api('/api/products', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      onSaved(result?.data)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Full-screen overlay — clicks outside close the modal */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* Modal panel — clicks inside do NOT close the modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 18,
            width: '100%',
            maxWidth: 560,
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'fade-up .25s ease both',
          }}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #1e1e1e', position: 'sticky', top: 0, background: '#111', zIndex: 1 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Image Upload */}
          <div>
            <label style={S.label}>Product Image</label>
            {form.image && (
              <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginBottom: 10, border: '1px solid #2a2a2a' }}>
                <Image src={form.image} alt="preview" width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }} onChange={handleImageUpload} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ ...S.ghostBtn, fontSize: '.78rem' }}>
                {uploading ? '⟳ Uploading…' : '↑ Upload Image'}
              </button>
              {form.image && <span style={{ fontSize: '.72rem', color: '#555' }}>Cloudinary ✓</span>}
            </div>
            {uploadErr && <p style={{ color: '#ff6b6b', fontSize: '.72rem', marginTop: 6 }}>{uploadErr}</p>}
          </div>

          {/* Name */}
          <div>
            <label style={S.label}>Product Name *</label>
            <input style={S.input} placeholder="e.g. Banarasi Silk Saree" value={form.name} onChange={update('name')} />
          </div>

          {/* Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Category *</label>
              <select style={{ ...S.input, cursor: 'pointer' }} value={form.category} onChange={update('category')}>
                {['Sarees', 'Suits', 'Lehengas', 'Accessories'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Badge</label>
              <input style={S.input} placeholder="e.g. ✦ New" value={form.badge} onChange={update('badge')} />
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={S.label}>Price (₹) *</label>
              <input style={S.input} type="number" placeholder="12999" value={form.price} onChange={update('price')} />
            </div>
            <div>
              <label style={S.label}>Original Price (₹)</label>
              <input style={S.input} type="number" placeholder="18999" value={form.originalPrice} onChange={update('originalPrice')} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={S.label}>Description</label>
            <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} placeholder="Product description…" value={form.description} onChange={update('description')} />
          </div>

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ ...S.label, margin: 0 }}>Status</label>
            <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.checked }))}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
              <span style={{ position: 'absolute', inset: 0, background: form.status ? '#d4a853' : '#444', borderRadius: 100, transition: '.3s' }}>
                <span style={{ position: 'absolute', width: 16, height: 16, left: form.status ? 23 : 3, top: 3, background: 'white', borderRadius: '50%', transition: '.3s' }} />
              </span>
            </label>
            <span style={{ fontSize: '.75rem', color: form.status ? '#d4a853' : '#666' }}>
              {form.status ? 'Active (visible on site)' : 'Draft (hidden)'}
            </span>
          </div>

          {/* Specs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ ...S.label, margin: 0 }}>Specifications</label>
              <button onClick={addSpec} style={{ ...S.ghostBtn, fontSize: '.72rem', padding: '5px 12px' }}>+ Add Row</button>
            </div>
            {form.specs.map((spec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 28px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input style={{ ...S.input, padding: '9px 8px', textAlign: 'center', fontSize: '1rem' }} placeholder="🧶" value={spec.icon} onChange={e => updateSpec(i, 'icon', e.target.value)} />
                <input style={{ ...S.input, padding: '9px 12px' }} placeholder="Label" value={spec.label} onChange={e => updateSpec(i, 'label', e.target.value)} />
                <input style={{ ...S.input, padding: '9px 12px' }} placeholder="Value" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} />
                <button onClick={() => removeSpec(i)} style={{ background: 'none', border: 'none', color: '#553355', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>
            ))}
          </div>

          <button onClick={save} disabled={saving} style={{ ...S.goldBtn, width: '100%', padding: 14, fontSize: '.9rem', borderRadius: 100 }}>
            {saving ? 'Saving…' : (editProduct ? 'Update Product' : 'Add Product')}
          </button>
        </div>
        </div> {/* closes modal panel */}
      </div>  {/* closes overlay */}
    </>
  )
}

// ── Main Dashboard ───────────────────────────────
export default function AdminDashboard() {
  const [panel, setPanel] = useState('analytics')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProds, setLoadingProds] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [search, setSearch] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Auth guard
    const token = localStorage.getItem('rr_admin_token')
    const expires = localStorage.getItem('rr_admin_expires')
    if (!token || (expires && Date.now() > Number(expires))) {
      window.location.href = '/admin'
      return
    }
    loadProducts()
    loadOrders()
  }, [])

  async function loadProducts() {
    setLoadingProds(true)
    try {
      const data = await api('/api/products/all')
      setProducts(data?.data || [])
    } catch { setProducts([]) }
    setLoadingProds(false)
  }

  async function loadOrders() {
    setLoadingOrders(true)
    try {
      const data = await api('/api/orders')
      setOrders(data?.data || [])
    } catch { setOrders([]) }
    setLoadingOrders(false)
  }

  async function toggleStatus(id, current) {
    try {
      const updated = await api(`/api/products/${id}`, {
        method: 'PUT', body: JSON.stringify({ status: !current }),
      })
      if (updated?.data) {
        setProducts(prev => prev.map(p => p._id === id ? updated.data : p))
      }
    } catch (err) { alert(err.message) }
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product permanently?')) return
    try {
      await api(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch (err) { alert(err.message) }
  }

  async function updateOrderStatus(id, status) {
    try {
      const updated = await api(`/api/orders/${id}`, {
        method: 'PUT', body: JSON.stringify({ status }),
      })
      if (updated?.data) setOrders(prev => prev.map(o => o._id === id ? updated.data : o))
    } catch (err) { alert(err.message) }
  }

  function logout() {
    localStorage.removeItem('rr_admin_token')
    localStorage.removeItem('rr_admin_expires')
    window.location.href = '/admin'
  }

  function openAdd() { setEditProduct(null); setModalOpen(true) }
  function openEdit(p) { setEditProduct(p); setModalOpen(true) }
  function onSaved(product) {
    if (!product) return
    setProducts(prev => {
      const exists = prev.find(p => p._id === product._id)
      return exists ? prev.map(p => p._id === product._id ? product : p) : [product, ...prev]
    })
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + (o.total || 0), 0)

  const navItems = [
    { key: 'analytics', icon: '📊', label: 'Analytics' },
    { key: 'products', icon: '👗', label: 'Products' },
    { key: 'orders', icon: '📦', label: 'Orders' },
  ]

  if (!isClient) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#444', fontSize: '.9rem' }}>Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div style={S.root}>
      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={S.sideTop}>
          <div style={S.brand}>◈ RADHA RANI PARIDHAN AJMER</div>
          <div style={S.brandSub}>ADMIN PANEL</div>
        </div>
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.key} onClick={() => setPanel(item.key)} style={S.navItem(panel === item.key)}>
              <span>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px 16px 24px', borderTop: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href="/" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#d4a853', padding: '8px 16px', fontSize: '.78rem' }}>
            ↗ View Site
          </a>
          <button onClick={logout} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#666', padding: '8px 16px', fontSize: '.78rem', cursor: 'pointer' }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>

        {/* ════ ANALYTICS ════ */}
        {panel === 'analytics' && (
          <div>
            <div style={S.pageHeader}>
              <h1 style={S.heading}>Analytics</h1>
              <span style={{ fontSize: '.75rem', color: '#444' }}>Live data from MongoDB</span>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Total Orders', value: orders.length, delta: `${orders.filter(o => o.status === 'pending').length} pending`, type: 'neutral' },
                { label: 'Revenue (All)', value: `₹${totalRevenue.toLocaleString('en-IN')}`, delta: `${orders.filter(o => o.status === 'delivered').length} delivered`, type: 'positive' },
                { label: 'Products Listed', value: products.length, delta: `${products.filter(p => p.status).length} active`, type: 'neutral' },
                { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, delta: 'orders cancelled', type: 'negative' },
              ].map(stat => (
                <div key={stat.label} style={S.statCard}>
                  <div style={{ fontSize: '.65rem', color: '#555', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 12 }}>{stat.label}</div>
                  <div style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: 8 }}>{stat.value}</div>
                  <div style={{ fontSize: '.72rem', color: stat.type === 'positive' ? '#d4a853' : stat.type === 'negative' ? '#ff6b6b' : '#555' }}>
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div style={S.card}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '.9rem', fontWeight: 700 }}>Recent Orders</h3>
                <button onClick={() => setPanel('orders')} style={{ ...S.ghostBtn, fontSize: '.72rem' }}>View All →</button>
              </div>
              {loadingOrders ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#444' }}>Loading…</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>📦</div>
                  <p style={{ fontSize: '.85rem' }}>No orders yet. Share your store link!</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                          <div style={{ fontSize: '.72rem', color: '#555' }}>{order.customer?.email}</div>
                        </td>
                        <td style={S.td}>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ ...S.td, color: '#d4a853', fontWeight: 700 }}>₹{(order.total || 0).toLocaleString('en-IN')}</td>
                        <td style={S.td}><span style={S.statusPill(order.status)}>{order.status}</span></td>
                        <td style={{ ...S.td, color: '#555' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ════ PRODUCTS ════ */}
        {panel === 'products' && (
          <div>
            <div style={S.pageHeader}>
              <h1 style={S.heading}>Products</h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: '.75rem', color: '#555' }}>{products.length} total · {products.filter(p => p.status).length} active</span>
                <button style={S.goldBtn} onClick={openAdd}>+ Add Product</button>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 8, padding: '10px 14px', marginBottom: 20, maxWidth: 340 }}>
              <span style={{ color: '#444' }}>⌕</span>
              <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#f0ede8', fontSize: '.82rem', width: '100%' }} />
            </div>

            {loadingProds ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>Loading products…</div>
            ) : (
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Image', 'Product', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p._id} style={{ transition: 'background .15s' }}>
                        <td style={{ ...S.td, width: 56 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', border: '1px solid #1e1e1e', background: '#0d0d0d' }}>
                            {p.image && (
                              <Image src={p.image} alt={p.name} width={44} height={44} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                        </td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                          <div style={{ fontSize: '.68rem', color: '#444' }}>{p.slug}</div>
                        </td>
                        <td style={S.td}><span style={S.badge(p.category)}>{p.category}</span></td>
                        <td style={{ ...S.td, color: '#d4a853', fontWeight: 700 }}>₹{(p.price || 0).toLocaleString('en-IN')}</td>
                        <td style={S.td}>
                          <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 20, cursor: 'pointer' }}>
                            <input type="checkbox" checked={p.status} onChange={() => toggleStatus(p._id, p.status)}
                              style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                            <span style={{ position: 'absolute', inset: 0, background: p.status ? '#d4a853' : '#333', borderRadius: 100, transition: '.3s' }}>
                              <span style={{ position: 'absolute', width: 14, height: 14, left: p.status ? 21 : 3, top: 3, background: 'white', borderRadius: '50%', transition: '.3s' }} />
                            </span>
                          </label>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(p)} style={{ ...S.ghostBtn, padding: '5px 12px' }}>Edit</button>
                            <button onClick={() => deleteProduct(p._id)} style={{ ...S.dangerBtn, padding: '5px 12px' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ ...S.td, textAlign: 'center', padding: 40, color: '#444' }}>
                          {search ? 'No products match your search.' : 'No products yet. Click "+ Add Product" to get started.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════ ORDERS ════ */}
        {panel === 'orders' && (
          <div>
            <div style={S.pageHeader}>
              <h1 style={S.heading}>Orders</h1>
              <button onClick={loadOrders} style={S.ghostBtn}>↻ Refresh</button>
            </div>

            {loadingOrders ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>Loading orders…</div>
            ) : orders.length === 0 ? (
              <div style={{ ...S.card, padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📦</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No orders yet</h3>
                <p style={{ color: '#555', fontSize: '.85rem' }}>Orders will appear here when customers check out.</p>
              </div>
            ) : (
              <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Update', 'Date'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '.72rem', color: '#555' }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                          <div style={{ fontSize: '.68rem', color: '#555' }}>{order.customer?.phone}</div>
                          <div style={{ fontSize: '.65rem', color: '#444', marginTop: 2 }}>
                            {order.shipping?.city}, {order.shipping?.state}
                          </div>
                        </td>
                        <td style={S.td}>
                          {order.items?.map((item, i) => (
                            <div key={i} style={{ fontSize: '.72rem', color: '#aaa' }}>
                              {item.name} ×{item.qty}
                            </div>
                          ))}
                        </td>
                        <td style={{ ...S.td, color: '#d4a853', fontWeight: 700 }}>
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={S.td}>
                          <span style={S.statusPill(order.status)}>{order.status}</span>
                        </td>
                        <td style={S.td}>
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order._id, e.target.value)}
                            style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 6, padding: '6px 10px', color: '#ddd', fontSize: '.75rem', cursor: 'pointer', outline: 'none' }}
                          >
                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ ...S.td, color: '#555', fontSize: '.72rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── PRODUCT MODAL ── */}
      {modalOpen && (
        <ProductModal
          editProduct={editProduct}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}