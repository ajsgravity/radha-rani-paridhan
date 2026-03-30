import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Ticker from '../../components/Ticker'
import Navbar from '../../components/Navbar'
import AddToCartButton from '../../components/AddToCartButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function getProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found — Radha Rani Paridhan Ajmer' }
  return {
    title: `${product.name} — Radha Rani Paridhan Ajmer`,
    description: product.description || `Shop ${product.name} at Radha Rani Paridhan Ajmer.`,
    openGraph: {
      images: [product.image],
    },
  }
}

function formatPrice(price) {
  if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`
  return price
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const priceFormatted = formatPrice(product.price)
  const originalPriceFormatted = product.originalPrice ? formatPrice(product.originalPrice) : null

  return (
    <>
      <Ticker />
      <Navbar />

      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>●</span>
        <Link href="/collections">Collections</Link>
        <span>●</span>
        {product.name}
      </div>

      <section className="product">
        {/* LEFT: Preview */}
        <div className="preview-wrap">
          {product.badge && <div className="badge-abs">{product.badge}</div>}
          <div className="preview-box">
            <Image
              src={product.image || '/images/placeholder.png'}
              alt={product.name}
              width={700}
              height={700}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              priority
            />
          </div>
          {product.specs && product.specs.length > 0 && (
            <div className="thumb-strip">
              {product.specs.slice(0, 4).map((spec) => (
                <div className="thumb" key={spec.label}>
                  <span>{spec.icon}</span> {spec.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="info">
          <h1 style={{ fontFamily: 'var(--font-serif)' }}>{product.name}</h1>
          <div className="pricing">
            <span className="price-now">{priceFormatted}</span>
            {originalPriceFormatted && (
              <span className="price-was">{originalPriceFormatted}</span>
            )}
            {originalPriceFormatted && product.originalPrice > product.price && (
              <span style={{
                background: 'rgba(212,168,83,.15)', color: 'var(--accent)',
                borderRadius: 100, padding: '3px 10px', fontSize: '.72rem', fontWeight: 700,
              }}>
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
          <p className="desc">{product.description}</p>

          <AddToCartButton
            product={{
              slug: product.slug,
              name: product.name,
              price: priceFormatted,
              image: product.image || '/images/placeholder.png',
            }}
          />

          {product.specs && product.specs.length > 0 && (
            <div className="specs">
              {product.specs.map((spec) => (
                <div className="spec-row" key={spec.label}>
                  <span className="spec-label">
                    <span className="spec-icon">{spec.icon}</span>
                    {spec.label}
                  </span>
                  <span className="spec-val">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
