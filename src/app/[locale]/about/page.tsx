import { getTranslations, getMessages } from 'next-intl/server'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default async function AboutPage() {
  const t = await getTranslations('about')
  const messages = await getMessages()
  const m = messages.about as Record<string, unknown>
  const stories = m.stories as { title: string; p1: string; p2: string }[]
  const valueItems = (m.values as Record<string, unknown>).items as { icon: string; title: string; desc: string }[]

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .ab-values-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 768px) {
          .ab-values-grid { grid-template-columns: 1fr !important; }
          .ab-hero { padding: 48px 20px 40px !important; }
          .ab-story { padding: 0 20px 48px !important; }
          .ab-story-card { padding: 28px 24px !important; }
          .ab-values-section { padding: 48px 20px !important; }
          .ab-cta { padding: 60px 20px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="ab-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          {t('badge')}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 20 }}>
          {t('hero.title1')}<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('hero.em')}</em>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 580, margin: '0 auto' }}>
          {t('hero.subtitle')}
        </p>
      </section>

      {/* Stories */}
      <section className="ab-story" style={{ maxWidth: 760, margin: '0 auto', padding: '0 40px 80px' }}>
        {stories.map((story, i) => (
          <div key={i} className="ab-story-card" style={{ background: 'white', borderRadius: 20, border: '1px solid #e8e7e2', padding: '48px 56px', marginBottom: i < stories.length - 1 ? 32 : 0 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 400, color: '#0f0f0e', marginBottom: 16 }}>{story.title}</h2>
            <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, marginBottom: 16 }}>{story.p1}</p>
            <p style={{ fontSize: 16, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300 }}>{story.p2}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="ab-values-section" style={{ background: '#f2f1ed', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e' }}>
              {t('values.title1')} <em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('values.em')}</em>
            </h2>
          </div>
          <div className="ab-values-grid">
            {valueItems.map((v, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 16, padding: 28, border: '1px solid #e8e7e2' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e', marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.6, fontWeight: 300 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta" style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>{t('cta.title')}</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 440, margin: '0 auto 32px' }}>{t('cta.subtitle')}</p>
        <a href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          {t('cta.btn')}
        </a>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
