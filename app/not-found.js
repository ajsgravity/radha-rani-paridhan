import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | Radha Rani Paridhan Ajmer',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-sans)',
      backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}>
      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{
          fontSize: '7rem', fontWeight: 800, color: 'transparent',
          backgroundImage: 'linear-gradient(135deg, #d4a853, rgba(212,168,83,.2))',
          WebkitBackgroundClip: 'text', backgroundClip: 'text',
          lineHeight: 1, marginBottom: 24, fontFamily: 'var(--font-serif)',
        }}>
          404
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem', maxWidth: 360, margin: '0 auto 36px', lineHeight: 1.7 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-block', background: 'var(--accent)', color: '#080808',
            borderRadius: 100, padding: '12px 28px', fontSize: '.875rem',
            fontWeight: 700, textDecoration: 'none',
          }}>
            ← Back Home
          </Link>
          <Link href="/collections" style={{
            display: 'inline-block', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: 100, padding: '12px 28px',
            fontSize: '.875rem', textDecoration: 'none', transition: 'border-color .2s',
          }}>
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  )
}
