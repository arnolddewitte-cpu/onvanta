import Link from 'next/link'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      <style>{`
        .hp-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-dashboard-preview { display: block; }
        .hp-features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .hp-pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .hp-hero-btns { flex-wrap: wrap; }
        @media (max-width: 768px) {
          .hp-hero { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hp-dashboard-preview { display: none !important; }
          .hp-features-grid { grid-template-columns: 1fr !important; }
          .hp-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <MarketingNav activePage="Home" />

      {/* Hero */}
      <section className="hp-hero" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 60px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a5fd4' }} />
            Employee onboarding platform
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-.5px', color: '#0f0f0e', marginBottom: 20 }}>
            New hires,<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>productive faster.</em>
          </h1>
          <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.6, marginBottom: 36, maxWidth: 460 }}>
            Structured onboarding, spaced repetition flashcards, and manager visibility — all in one system built for growing teams.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start free trial →
            </Link>
            <a href="#features" style={{ fontSize: 15, color: '#3a3a38', background: 'transparent', border: '1px solid #e8e7e2', padding: '13px 24px', borderRadius: 12, textDecoration: 'none' }}>
              See how it works
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#7a7a78' }}>
            <div style={{ display: 'flex' }}>
              {['S', 'M', 'A'].map((l, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid #faf9f6', background: i === 0 ? '#e8f0fc' : i === 1 ? '#e2f4eb' : '#fdf0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: i === 0 ? '#1a5fd4' : i === 1 ? '#177a4a' : '#b05c0a', marginLeft: i === 0 ? 0 : -6 }}>{l}</div>
              ))}
            </div>
            14-day free trial · No credit card required
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="hp-dashboard-preview" style={{ background: 'white', border: '1px solid #e8e7e2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,.06)' }}>
          <div style={{ background: 'white', borderBottom: '1px solid #e8e7e2', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#f87171', '#fbbf24', '#4ade80'].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: '#f2f1ed', borderRadius: 5, padding: '4px 10px', fontSize: 11, color: '#7a7a78', textAlign: 'center' }}>app.onvanta.io/dashboard</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0e', marginBottom: 2 }}>Good morning, Sarah 👋</div>
            <div style={{ fontSize: 11, color: '#7a7a78', marginBottom: 12 }}>Day 4 of onboarding · Customer Service</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {[['68%', 'Progress'], ['3', 'Tasks today'], ['82%', 'Quiz score']].map(([v, l], i) => (
                <div key={i} style={{ background: '#f2f1ed', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#0f0f0e' }}>{v}</div>
                  <div style={{ fontSize: 10, color: '#7a7a78', marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7a78', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>Today's tasks</div>
            {[['Watch product demo video', true], ['Complete printing techniques quiz', true], ['Set up customer portal access', false]].map(([t, done], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#3a3a38', marginBottom: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: done ? '#1a5fd4' : 'transparent', border: done ? 'none' : '1.5px solid #e8e7e2', flexShrink: 0 }} />
                <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#7a7a78' : '#3a3a38' }}>{t as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: '#f2f1ed', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', marginBottom: 16 }}>Features</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Everything your team needs<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>to onboard well.</em></h2>
          <p style={{ fontSize: 18, color: '#3a3a38', fontWeight: 300, maxWidth: 560, margin: '0 auto 56px' }}>Not a generic LMS. Not a HRIS. Built specifically for employee onboarding and knowledge retention.</p>
          <div className="hp-features-grid">
            {[
              { icon: '📋', title: 'Structured onboarding', desc: 'Build templates with phases, steps, and content blocks. Every new hire gets the same solid experience.' },
              { icon: '🃏', title: 'Spaced repetition', desc: 'ANKI-style flashcards built into onboarding. Knowledge sticks because it\'s reviewed at the right intervals.' },
              { icon: '👁️', title: 'Manager visibility', desc: 'At-risk detection, quiz scores, flashcard accuracy. Know who\'s struggling before the 30-day review.' },
              { icon: '⚡', title: '60-second setup', desc: 'Pick a template, assign a manager, set a start date. Your first onboarding is running in under a minute.' },
              { icon: '🎯', title: 'Role-specific templates', desc: 'Different templates for CS, Sales, Operators. Each role gets content built for their actual job.' },
              { icon: '✅', title: 'Manager approvals', desc: 'Block progression until a manager signs off. Ensure standards are met before moving to the next phase.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 28, textAlign: 'left', border: '1px solid #e8e7e2' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', marginBottom: 16 }}>Pricing</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>Simple pricing,<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>no surprises.</em></h2>
          <p style={{ fontSize: 18, color: '#3a3a38', fontWeight: 300, maxWidth: 520, margin: '0 auto 48px' }}>Per active onboardee. Only pay when someone is actively being onboarded. Managers and admins are always free.</p>
          <div className="hp-pricing-grid" style={{ maxWidth: 860, margin: '0 auto' }}>
            {[
              { name: 'Starter', desc: 'Small teams, up to 10 onboardees', price: '€7', unit: '/seat/mo', featured: false, features: ['All block types', 'Spaced repetition', 'Employee + manager dashboards'] },
              { name: 'Pro', desc: 'Growing teams, unlimited onboardees', price: '€12', unit: '/seat/mo', featured: true, features: ['Everything in Starter', 'Advanced reporting', 'Custom branding', 'Priority support'] },
              { name: 'Enterprise', desc: 'Large orgs, compliance, SSO', price: 'Custom', unit: '', featured: false, features: ['Everything in Pro', 'SSO / SAML', 'Dedicated CSM', 'Custom SLA'] },
            ].map((p, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 28, border: p.featured ? '2px solid #1a5fd4' : '1px solid #e8e7e2', position: 'relative' }}>
                {p.featured && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1a5fd4', color: 'white', fontSize: 11, fontWeight: 500, padding: '3px 12px', borderRadius: 20 }}>Most popular</div>}
                <div style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: '#7a7a78', marginBottom: 12 }}>{p.desc}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 36, fontWeight: 500, color: '#0f0f0e' }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: '#7a7a78' }}>{p.unit}</span>
                </div>
                <div style={{ borderTop: '1px solid #e8e7e2', paddingTop: 16, marginBottom: 20 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3a3a38', marginBottom: 8, textAlign: 'left' }}>
                      <span style={{ color: '#1a5fd4' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none', background: p.featured ? '#1a5fd4' : '#f2f1ed', color: p.featured ? 'white' : '#0f0f0e' }}>
                  {p.name === 'Enterprise' ? 'Contact sales' : 'Start free trial'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1a5fd4', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>Ready to onboard smarter?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 520, margin: '0 auto 32px' }}>Start your free 14-day trial. Full Pro access, no credit card required.</p>
        <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          Start free trial →
        </Link>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 16 }}>14-day free trial · Full Pro access · No credit card required</div>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}