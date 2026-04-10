'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const t = useTranslations('app.signup')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    size: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const steps = [
    { label: t('step1Label'), desc: t('step1Desc') },
    { label: t('step2Label'), desc: t('step2Desc') },
  ]

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('error'))
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError(t('error'))
      setLoading(false)
    }
  }

  if (done) {
    return (
      <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e8e7e2', background: 'white' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
          </Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: '#0f0f0e', marginBottom: 12 }}>{t('successTitle')}</h1>
            <p style={{ fontSize: 16, color: '#3a3a38', fontWeight: 300, marginBottom: 8, lineHeight: 1.6 }}>{t('successSubtitle')}</p>
            <p style={{ fontSize: 16, color: '#3a3a38', fontWeight: 300, marginBottom: 32, lineHeight: 1.6 }}>{t('successText', { email: form.email })}</p>
            <div style={{ background: '#e8f0fc', borderRadius: 12, padding: '16px 20px', fontSize: 14, color: '#1a5fd4', textAlign: 'left' }}>
              <strong>{t('successStepsTitle')}</strong><br />
              1. {t('successStep1')}<br />
              2. {t('successStep2')}<br />
              3. {t('successStep3')}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .su-left { display: flex; }
        .su-grid { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) {
          .su-left { display: none !important; }
          .su-grid { grid-template-columns: 1fr !important; }
          .su-right { padding: 32px 24px !important; align-items: flex-start !important; }
        }
      `}</style>

      <nav style={{ padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e7e2', background: 'white' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: '#7a7a78', textDecoration: 'none' }}>
          {t('alreadyHaveAccount')} <span style={{ color: '#1a5fd4', fontWeight: 500 }}>{t('login')}</span>
        </Link>
      </nav>

      <div className="su-grid" style={{ flex: 1, minHeight: 'calc(100vh - 60px)' }}>

        <div className="su-left" style={{ background: '#0f0f0e', padding: '64px 56px', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>{t('trialBadge')}</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: 'white', lineHeight: 1.2, marginBottom: 16, fontWeight: 400 }}>
              {t('heroTitle')}<br /><em style={{ fontStyle: 'italic', color: '#7aaefc' }}>{t('heroEm')}</em>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, maxWidth: 340 }}>
              {t('heroText')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 48 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', position: 'relative' }}>
                  {i < steps.length - 1 && <div style={{ position: 'absolute', left: 15, top: 44, width: 1, height: 'calc(100% - 16px)', background: 'rgba(255,255,255,.1)' }} />}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${i + 1 < step ? '#4ade80' : i + 1 === step ? '#7aaefc' : 'rgba(255,255,255,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: i + 1 < step ? '#4ade80' : i + 1 === step ? '#7aaefc' : 'rgba(255,255,255,.4)', flexShrink: 0, background: i + 1 < step ? 'rgba(74,222,128,.15)' : i + 1 === step ? 'rgba(122,174,252,.1)' : 'transparent' }}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: i + 1 === step ? 'white' : 'rgba(255,255,255,.4)' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
              {['LP', 'MK', 'AV'].map((a, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #0f0f0e', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.7)', marginLeft: i === 0 ? 0 : -6 }}>{a}</div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{t('joinedBy')}</div>
          </div>
        </div>

        <div className="su-right" style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px' }}>
          <div style={{ maxWidth: 380, width: '100%' }}>

            {step === 1 && (
              <>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#0f0f0e' }}>{t('step1Title')}</h3>
                <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>{t('step1Subtitle')}</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>{t('nameLabel')}</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('namePlaceholder')} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>{t('emailLabel')}</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('emailPlaceholder')} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <button onClick={() => setStep(2)} disabled={!form.name || !form.email} style={{ width: '100%', padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: !form.name || !form.email ? 0.4 : 1 }}>
                  {t('continueBtn')}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#0f0f0e' }}>{t('step2Title')}</h3>
                <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>{t('step2Subtitle')}</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>{t('companyLabel')}</label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder={t('companyPlaceholder')} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>{t('sizeLabel')}</label>
                  <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none', background: 'white' }}>
                    <option value="">{t('sizeSelect')}</option>
                    <option value="1-10">{t('size1')}</option>
                    <option value="10-50">{t('size2')}</option>
                    <option value="50-100">{t('size3')}</option>
                    <option value="100+">{t('size4')}</option>
                  </select>
                </div>

                {error && (
                  <div style={{ background: '#fdecea', border: '1px solid #f5c4b3', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c0392b', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div style={{ background: '#e2f4eb', border: '1px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#177a4a', marginBottom: 20 }}>
                  {t('trialNote')}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 13, background: 'transparent', color: '#3a3a38', border: '1px solid #e8e7e2', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>{t('back')}</button>
                  <button onClick={handleSubmit} disabled={!form.company || loading} style={{ flex: 2, padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: !form.company || loading ? 0.4 : 1 }}>
                    {loading ? t('submitting') : t('submit')}
                  </button>
                </div>
              </>
            )}

            <p style={{ fontSize: 12, color: '#b8b8b5', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              {t('terms')} <a href="/terms" style={{ color: '#1a5fd4' }}>{t('termsLink')}</a> {t('and')} <a href="/privacy" style={{ color: '#1a5fd4' }}>{t('privacyLink')}</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
