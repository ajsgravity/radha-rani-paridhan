import Link from 'next/link'
import Image from 'next/image'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'

const showcaseItems = [
  { name: 'Festival Look', user: '@priya_shah', color: '#1a1a2e', outfit: 'Silk Saree', tall: true },
  { name: 'Reception Ready', user: '@ananya_m', color: '#0d2137', outfit: 'Anarkali Suit', tall: false },
  { name: 'Wedding Glam', user: '@neha_design', color: '#1e1207', outfit: 'Bridal Lehenga', tall: false },
  { name: 'Sangeet Style', user: '@ritu_fashion', color: '#0e1f0e', outfit: 'Sharara Set', tall: false },
  { name: 'Pooja Elegance', user: '@meera_arts', color: '#1c0d1c', outfit: 'Cotton Saree', tall: false },
  { name: 'Mehendi Magic', user: '@divya_k', color: '#0d1a1a', outfit: 'Palazzo Suit', tall: true },
]

export const metadata = {
  title: 'Community — Radha Rani Paridhan Ajmer',
  description: 'See how our customers style their Radha Rani Paridhan Ajmer outfits. Get inspired!',
}

export default function CommunityPage() {
  return (
    <>
      <Ticker />
      <Navbar />

      <section className="community">
        <div className="comm-header">
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>
            Styled by our<br /><em>customers</em>
          </h2>
          <p>
            Share your look, tag us on Instagram, and get featured
            in the Radha Rani Paridhan Ajmer showcase.
          </p>
          <div className="comm-ctas">
            <Link href="/collections">
              <button className="btn-filled">Browse Collections</button>
            </Link>
            <button className="btn-ghost">Follow on Instagram →</button>
          </div>
        </div>

        <div className="mosaic">
          {showcaseItems.map((item) => (
            <div className={`mosaic-card ${item.tall ? 'tall' : ''}`} key={item.name}>
              <div className="mosaic-card-img" style={{ background: item.color }}>
                <span className="outfit-tag">{item.outfit}</span>
              </div>
              <div className="card-meta">
                <strong>{item.name}</strong>
                <span>{item.user}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
