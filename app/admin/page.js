'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AdminLoginPage() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!key.trim()) {
      setError('Please enter your secret key.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ secretKey: key.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      // Store JWT
      localStorage.setItem('rr_admin_token', data.accessToken)
      localStorage.setItem('rr_admin_expires', String(Date.now() + 8 * 60 * 60 * 1000))
      window.location.href = '/admin/dashboard'
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#080808', fontFamily: 'var(--font-sans)',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,168,83,.06), transparent)',
    }}>
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 18,
        padding: 48, width: '100%', maxWidth: 420,
        animation: 'fade-up 0.5s ease both',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 20 }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Owner Access
        </h1>
        <p style={{ fontSize: '.82rem', color: '#555', marginBottom: 32 }}>
          radha-rani-admin · restricted area
        </p>

        <div className="field">
          <label style={{ fontSize: '.72rem', fontWeight: 600, color: '#555', letterSpacing: '.07em', textTransform: 'uppercase' }}>
            Owner Secret Key
          </label>
          <input
            id="admin-key-input"
            type="password"
            placeholder="Enter your secret key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              background: '#0d0d0d', border: '1px solid #222', borderRadius: 8,
              padding: '13px 16px', color: '#f0ede8', fontSize: '.875rem',
              outline: 'none', width: '100%', letterSpacing: '.05em',
              marginTop: 8,
            }}
          />
        </div>

        <button
          id="admin-login-btn"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#8a7a4a' : '#d4a853', color: '#080808',
            border: 'none', borderRadius: 100, padding: 14,
            fontSize: '.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '.04em', marginTop: 20,
            transition: 'opacity .2s, transform .15s',
          }}
        >
          {loading ? 'Verifying...' : 'Unlock Dashboard →'}
        </button>

        {error && (
          <p style={{ color: '#ff4d4d', fontSize: '.78rem', marginTop: 12, textAlign: 'center' }}>
            ⚠ {error}
          </p>
        )}
      </div>
    </div>
  )
}
