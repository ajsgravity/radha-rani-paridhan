import Image from 'next/image'
import Link from 'next/link'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'
import AddToCartButton from '../components/AddToCartButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const metadata = {
  title: 'Collections — Radha Rani Paridhan Ajmer',
  description: 'Explore our complete collection of sarees, lehengas, anarkali suits and ethnic wear.',
}

async function getProducts(category) {
  try {
    const url = category
      ? `${API_URL}/api/products?category=${category}`
      : `${API_URL}/api/products`
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

function formatPrice(price) {
  if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`
  return price
}

const CATEGORIES = ['All', 'Sarees', 'Suits', 'Lehengas', 'Accessories']

export default async function CollectionsPage({ searchParams }) {
  const params = await searchParams
  const activeCategory = params?.category || ''
  const products = await getProducts(activeCategory)

  return (
    <>
      <Ticker />
      <Navbar />

      <section className="hero">
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)' }}>
            Our <em>Collections</em>
          </h1>
          <p style={{ color: 'var(--muted)', maxWidth: 400, fontSize: '0.95rem', lineHeight: 1.7, marginTop: 12 }}>
            Curated pieces for every occasion — from everyday elegance to grand celebrations.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <div style={{
        display: 'flex', gap: 10, padding: '0 48px 32px', flexWrap: 'wrap',
      }}>
        {CATEGORIES.map((cat) => {
          const value = cat === 'All' ? '' : cat
          const isActive = activeCategory === value
          return (
            <Link
              key={cat}
              href={value ? `/collections?category=${value}` : '/collections'}
              style={{
                padding: '8px 20px',
                borderRadius: 100,
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                fontSize: '.82rem', fontWeight: isActive ? 700 : 400,
                textDecoration: 'none', transition: 'all .2s',
              }}
            >
              {cat}
            </Link>
          )
        })}
      </div>

      <section className="grid">
        {products.map((product, index) => (
          <div className="card" key={product._id} style={{ animationDelay: `${index * 0.08}s` }}>
            <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
              <div className="card-preview">
                <Image
                  src={product.image || '/images/placeholder.png'}
                  alt={product.name}
                  width={600}
                  height={600}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card-body">
                {product.badge && <div className="badge">{product.badge}</div>}
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                  <span className="price">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span style={{ fontSize: '.8rem', color: 'var(--muted)', textDecoration: 'line-through' }}>
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            <div style={{ padding: '0 24px 20px' }}>
              <AddToCartButton
                product={{
                  slug: product.slug,
                  name: product.name,
                  price: formatPrice(product.price),
                  image: product.image || '/images/placeholder.png',
                }}
                variant="small"
              />
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '80px 24px',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>✦</div>
            <p>No products found{activeCategory ? ` in ${activeCategory}` : ''}.</p>
          </div>
        )}
      </section>
    </>
  )
}
