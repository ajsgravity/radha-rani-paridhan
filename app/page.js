import Image from 'next/image'
import Link from 'next/link'
import Ticker from './components/Ticker'
import Navbar from './components/Navbar'
import AddToCartButton from './components/AddToCartButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const metadata = {
  title: 'Radha Rani Paridhan Ajmer — Premium Indian Ethnic Wear',
  description: 'Discover timeless elegance with handcrafted sarees, lehengas, anarkali suits and ethnic wear from Radha Rani Paridhan Ajmer. Premium quality, authentic craftsmanship.',
}

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 60 }, // ISR: refresh every 60s
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

function formatPrice(price) {
  if (typeof price === 'number') {
    return `₹${price.toLocaleString('en-IN')}`
  }
  return price
}

export default async function Home() {
  const products = await getProducts()

  return (
    <>
      {/* ① TICKER BAR */}
      <Ticker />

      {/* ② NAVBAR */}
      <Navbar />

      {/* ③ HERO */}
      <section className="hero">
        <h1 style={{ fontFamily: 'var(--font-serif)' }}>
          Elegance woven<br />into every <em>thread</em>
        </h1>
        <Link href="/collections">
          <button className="btn-secondary">View All Collections →</button>
        </Link>
      </section>

      {/* ④ PRODUCT GRID */}
      <section className="grid">
        {products.slice(0, 6).map((product, index) => (
          <div className="card" key={product._id} style={{ animationDelay: `${index * 0.1}s` }}>
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
                <div className="price">{formatPrice(product.price)}</div>
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

        {/* If no products in DB yet, show placeholder message */}
        {products.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '80px 24px',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛍️</div>
            <p>Products are being added. Check back soon!</p>
            <Link href="/admin" style={{ color: 'var(--accent)', fontSize: '.85rem', marginTop: 12, display: 'block' }}>
              Admin → Add Products
            </Link>
          </div>
        )}
      </section>

      {/* ⑤ FOOTER STRIP */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--muted)',
        fontSize: '.8rem',
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '.1em' }}>
          RADHA RANI PARIDHAN AJMER
        </span>
        <span>© {new Date().getFullYear()} · Handcrafted with love in Varanasi</span>
        <div style={{ display: 'flex', gap: 24 }}>
          <Link href="/collections" style={{ color: 'var(--muted)' }}>Collections</Link>
          <Link href="/contact" style={{ color: 'var(--muted)' }}>Contact</Link>
          <Link href="/admin" style={{ color: 'var(--muted)' }}>Admin</Link>
        </div>
      </footer>
    </>
  )
}
