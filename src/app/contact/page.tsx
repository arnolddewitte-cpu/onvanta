'use client'

import { useState } from 'react'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSubmitting(false)
    if (res.ok) {
      setSent(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .ct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
        @media (max-width: 768px) {
          .ct-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 40px 20px !important; }
        }
      `}</style>

      <MarketingNav activePage="Contact" />

      <div className="ct-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 40px' }}>

        {/* Left */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
            Contact
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 20 }}>
            Let's talk about<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>your team.</em>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, marginBottom: 40 }}>
            Whether you have a question, want a demo, or just want to see if Onvanta is the right fit — we're happy to talk.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { icon: '✉️', title: 'Email', value: 'hello@onvanta.io', desc: 'We reply within one business day.' },
              { icon: '💬', title: 'Demo', value: 'Book a 30-minute call', desc: 'See Onvanta in action for your team.' },
              { icon: '📍', title: 'Location', value: 'The Netherlands', desc: 'Serving teams across Europe.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 40, height: 40, background: '#e8f0fc', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#7a7a78', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0e' }}>{item.value}</div>
                  <div style={{ fontSize: 13, color: '#7a7a78', fontWeight: 300 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: 40 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: '#0f0f0e', marginBottom: 8 }}>Message sent!</h3>
              <p style={{ fontSize: 15, color: '#3a3a38', fontWeight: 300, lineHeight: 1.6 }}>Thanks for reaching out. We'll get back to you within one business day.</p>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 400, color: '#0f0f0e', marginBottom: 6 }}>Send us a message</h3>
              <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>We'll get back to you within one business day.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Your name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jan de Vries" style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Work email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jan@company.com" style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Company <span style={{ color: '#b8b8b5', fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme B.V." style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your team and what you're looking for..." rows={5} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none', resize: 'vertical' }} />
                </div>
                {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
                <button onClick={handleSubmit} disabled={!form.name || !form.email || !form.message || submitting} style={{ width: '100%', padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: !form.name || !form.email || !form.message || submitting ? 0.4 : 1 }}>
                  {submitting ? 'Sending...' : 'Send message →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}