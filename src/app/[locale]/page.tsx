import Link from 'next/link'
import { getTranslations, getMessages } from 'next-intl/server'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default async function HomePage() {
  const t = await getTranslations('home')
  const messages = await getMessages()
  const m = messages.home as Record<string, unknown>
  const featureItems = (m.features as Record<string, unknown>).items as { icon: string; title: string; desc: string }[]
  const pricingExamples = (m.pricing as Record<string, unknown>).examples as { n: number; price: string }[]

  return (
    <main className="min-h-screen" style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      <style>{`
        .hp-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hp-dashboard-preview { display: block; }
        .hp-features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .hp-hero-btns { flex-wrap: wrap; }
        @media (max-width: 768px) {
          .hp-hero { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hp-dashboard-preview { display: none !important; }
          .hp-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="hp-hero" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 60px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a5fd4' }} />
            {t('badge')}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-.5px', color: '#0f0f0e', marginBottom: 20 }}>
            {t('hero.line1')}<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('hero.em')}</em>
          </h1>
          <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.6, marginBottom: 36, maxWidth: 460 }}>
            {t('hero.subtitle')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
            <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t('hero.ctaPrimary')}
            </Link>
            <a href="#functies" style={{ fontSize: 15, color: '#3a3a38', background: 'transparent', border: '1px solid #e8e7e2', padding: '13px 24px', borderRadius: 12, textDecoration: 'none' }}>
              {t('hero.ctaSecondary')}
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#7a7a78' }}>
            <div style={{ display: 'flex' }}>
              {['S', 'M', 'A'].map((l, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid #faf9f6', background: i === 0 ? '#e8f0fc' : i === 1 ? '#e2f4eb' : '#fdf0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: i === 0 ? '#1a5fd4' : i === 1 ? '#177a4a' : '#b05c0a', marginLeft: i === 0 ? 0 : -6 }}>{l}</div>
              ))}
            </div>
            {t('hero.social')}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="hp-dashboard-preview" style={{ background: 'white', border: '1px solid #e8e7e2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,.06)' }}>
          <div style={{ background: 'white', borderBottom: '1px solid #e8e7e2', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#f87171', '#fbbf24', '#4ade80'].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ flex: 1, background: '#f2f1ed', borderRadius: 5, padding: '4px 10px', fontSize: 11, color: '#7a7a78', textAlign: 'center' }}>{t('preview.url')}</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0e', marginBottom: 2 }}>{t('preview.greeting')}</div>
            <div style={{ fontSize: 11, color: '#7a7a78', marginBottom: 12 }}>{t('preview.day')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {([['preview.progress', '68%'], ['preview.tasksToday', '3'], ['preview.quizScore', '82%']] as const).map(([key, val], i) => (
                <div key={i} style={{ background: '#f2f1ed', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 20, fontWeight: 500, color: '#0f0f0e' }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#7a7a78', marginTop: 1 }}>{t(key)}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#7a7a78', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 8 }}>{t('preview.tasksLabel')}</div>
            {([['preview.task1', true], ['preview.task2', true], ['preview.task3', false]] as const).map(([key, done], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#3a3a38', marginBottom: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: done ? '#1a5fd4' : 'transparent', border: done ? 'none' : '1.5px solid #e8e7e2', flexShrink: 0 }} />
                <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#7a7a78' : '#3a3a38' }}>{t(key)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="functies" style={{ background: '#f2f1ed', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', marginBottom: 16 }}>{t('features.badge')}</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>{t('features.title1')}<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('features.em')}</em></h2>
          <p style={{ fontSize: 18, color: '#3a3a38', fontWeight: 300, maxWidth: 560, margin: '0 auto 56px' }}>{t('features.subtitle')}</p>
          <div className="hp-features-grid">
            {featureItems.map((f, i) => (
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
      <section id="prijzen" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', marginBottom: 16 }}>{t('pricing.badge')}</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>{t('pricing.title1')}<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('pricing.em')}</em></h2>
          <p style={{ fontSize: 18, color: '#3a3a38', fontWeight: 300, maxWidth: 520, margin: '0 auto 48px' }}>{t('pricing.subtitle')}</p>

          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            <div style={{ background: 'white', border: '2px solid #1a5fd4', borderRadius: 20, padding: '36px 32px', textAlign: 'center', boxShadow: '0 4px 32px rgba(26,95,212,.10)' }}>
              <div style={{ display: 'inline-block', background: '#1a5fd4', color: 'white', fontSize: 11, fontWeight: 500, padding: '4px 16px', borderRadius: 20, marginBottom: 20 }}>
                {t('pricing.trial')}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 60, fontWeight: 400, color: '#0f0f0e', lineHeight: 1 }}>{t('pricing.price')}</span>
              </div>
              <div style={{ fontSize: 14, color: '#7a7a78', marginBottom: 24 }}>{t('pricing.perMonth')}</div>

              <div style={{ background: '#f2f1ed', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
                {pricingExamples.map(({ n, price }) => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#3a3a38', padding: '4px 0' }}>
                    <span>{n} {t('pricing.newEmployees')}</span>
                    <span style={{ fontWeight: 600, color: '#0f0f0e' }}>{price}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#b8b8b5', marginTop: 8 }}>{t('pricing.examplesNote')}</div>
              </div>

              <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: 'none', background: '#1a5fd4', color: 'white', marginBottom: 16 }}>
                {t('pricing.cta')}
              </Link>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: '#7a7a78' }}>
                <span>{t('pricing.feat1')}</span>
                <span>{t('pricing.feat2')}</span>
                <span>{t('pricing.feat3')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1a5fd4', padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>{t('cta.title')}</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 520, margin: '0 auto 32px' }}>{t('cta.subtitle')}</p>
        <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          {t('cta.btn')}
        </Link>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 16 }}>{t('cta.note')}</div>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
