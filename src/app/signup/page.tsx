'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    size: '',
    password: '',
  })
  const [done, setDone] = useState(false)

  function handleNext() {
    if (step < 3) setStep(step + 1)
    else setDone(true)
  }

  const steps = [
    { label: 'Your details', desc: 'Name and work email' },
    { label: 'Your company', desc: 'Company info' },
    { label: 'Set password', desc: 'Secure your account' },
  ]

  if (done) {
    return (
      <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e7e2', background: 'white' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
          </Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: '#0f0f0e', marginBottom: 12 }}>Welcome to Onvanta!</h1>
            <p style={{ fontSize: 16, color: '#3a3a38', fontWeight: 300, marginBottom: 32, lineHeight: 1.6 }}>Your 14-day Pro trial is active. Check your inbox for a magic link to log in.</p>
            <Link href="/login" style={{ display: 'inline-block', background: '#1a5fd4', color: 'white', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Go to login →
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8e7e2', background: 'white' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: '#7a7a78', textDecoration: 'none' }}>
          Already have an account? <span style={{ color: '#1a5fd4', fontWeight: 500 }}>Log in</span>
        </Link>
      </nav>

      {/* Page */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 60px)' }}>

        {/* Left panel */}
        <div style={{ background: '#0f0f0e', padding: '64px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>Start free trial</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 36, color: 'white', lineHeight: 1.2, marginBottom: 16, fontWeight: 400 }}>
              Your team deserves<br /><em style={{ fontStyle: 'italic', color: '#7aaefc' }}>better onboarding.</em>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, maxWidth: 340 }}>
              14 days free. Full Pro access. No credit card required. Your first onboarding takes less than an hour to set up.
            </p>

            {/* Steps indicator */}
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
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Joined by 200+ HR teams this year</div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px' }}>
          <div style={{ maxWidth: 380, width: '100%' }}>

            {step === 1 && (
              <>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#0f0f0e' }}>Create your account</h3>
                <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>Start your 14-day free trial. No credit card required.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Full name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jan de Vries" style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Work email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jan@company.com" style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <button onClick={handleNext} disabled={!form.name || !form.email} style={{ width: '100%', padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: !form.name || !form.email ? 0.4 : 1 }}>
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#0f0f0e' }}>About your company</h3>
                <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>Help us set up your workspace.</p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Company name</label>
                  <input type="text" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Acme B.V." style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Team size</label>
                  <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none', background: 'white' }}>
                    <option value="">Select team size</option>
                    <option value="1-10">1–10 employees</option>
                    <option value="10-50">10–50 employees</option>
                    <option value="50-100">50–100 employees</option>
                    <option value="100+">100+ employees</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 13, background: 'transparent', color: '#3a3a38', border: '1px solid #e8e7e2', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
                  <button onClick={handleNext} disabled={!form.company || !form.size} style={{ flex: 2, padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: !form.company || !form.size ? 0.4 : 1 }}>
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, marginBottom: 6, color: '#0f0f0e' }}>Set your password</h3>
                <p style={{ fontSize: 14, color: '#7a7a78', marginBottom: 28 }}>Almost there — secure your account.</p>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#3a3a38', marginBottom: 6 }}>Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" style={{ width: '100%', padding: '11px 14px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: '#0f0f0e', outline: 'none' }} />
                </div>
                <div style={{ background: '#e2f4eb', border: '1px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#177a4a', marginBottom: 24 }}>
                  ✓ 14-day free trial · Full Pro access · No credit card required
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, padding: 13, background: 'transparent', color: '#3a3a38', border: '1px solid #e8e7e2', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
                  <button onClick={handleNext} disabled={form.password.length < 8} style={{ flex: 2, padding: 13, background: '#1a5fd4', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: form.password.length < 8 ? 0.4 : 1 }}>
                    Start free trial →
                  </button>
                </div>
              </>
            )}

            <p style={{ fontSize: 12, color: '#b8b8b5', textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
              By signing up you agree to our <a href="#" style={{ color: '#1a5fd4' }}>Terms</a> and <a href="#" style={{ color: '#1a5fd4' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}