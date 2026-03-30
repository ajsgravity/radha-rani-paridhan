import Link from 'next/link'
import CartIcon from './CartIcon'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo" style={{ fontFamily: 'var(--font-serif)' }}>
        RADHA RANI PARIDHAN AJMER
      </Link>
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/collections">Collections</Link></li>
        <li><Link href="/community">Community</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <CartIcon />
        <Link href="/collections">
          <button className="btn-primary">Shop Now</button>
        </Link>
      </div>
    </nav>
  )
}
