'use client'

import { useState } from 'react'
import Image from 'next/image'
import Ticker from '../components/Ticker'
import Navbar from '../components/Navbar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
  })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errMsg, setErrMsg] = useState('')

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.subject || !form.message) {
      setErrMsg('Please fill in all required fields.')
      return
    }
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setStatus('success')
      setForm({ firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setErrMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <>
      <Ticker />
      <Navbar />

      {/* Info Cards */}
      <div className="contact-info">
        <div className="info-card">
          <div className="val">hello@radharani.in</div>
          <div className="label">Email Address</div>
        </div>
        <div className="info-card">
          <div className="val">+91 98765 43210</div>
          <div className="label">Phone / WhatsApp</div>
        </div>
        <div className="info-card">
          <div className="val">Varanasi, Uttar Pradesh</div>
          <div className="label">Store Location</div>
        </div>
      </div>

      {/* Body: Image + Form */}
      <div className="contact-body">
        {/* LEFT: Store Image */}
        <div className="store-image">
          <Image
            src="/images/store.png"
            alt="Radha Rani Paridhan Store Interior"
            width={700}
            height={700}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* RIGHT: Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2 style={{ fontFamily: 'var(--font-serif)' }}>Get in touch</h2>

          {status === 'success' && (
            <div style={{
              background: 'rgba(212,168,83,.1)', border: '1px solid rgba(212,168,83,.3)',
              borderRadius: 10, padding: '14px 18px', marginBottom: 20,
              color: 'var(--accent)', fontSize: '.875rem',
            }}>
              ✓ Message sent! We&apos;ll be in touch soon.
            </div>
          )}

          <div className="form-row">
            <div className="field">
              <label>FIRST NAME *</label>
              <input type="text" placeholder="Priya" value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div className="field">
              <label>LAST NAME</label>
              <input type="text" placeholder="Sharma" value={form.lastName} onChange={update('lastName')} />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>EMAIL *</label>
              <input type="email" placeholder="priya@example.com" value={form.email} onChange={update('email')} required />
            </div>
            <div className="field">
              <label>PHONE</label>
              <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} />
            </div>
          </div>

          <div className="field">
            <label>SUBJECT *</label>
            <input type="text" placeholder="Custom order, bulk inquiry, partnership..." value={form.subject} onChange={update('subject')} required />
          </div>

          <div className="field">
            <label>MESSAGE *</label>
            <textarea placeholder="Tell us about your requirement..." value={form.message} onChange={update('message')} required />
          </div>

          {errMsg && (
            <div style={{ color: '#ff6b6b', fontSize: '.82rem', marginBottom: 12 }}>
              ⚠ {errMsg}
            </div>
          )}

          <button className="btn-send" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </>
  )
}
