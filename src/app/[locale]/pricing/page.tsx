import Link from 'next/link'
import { getTranslations, getMessages } from 'next-intl/server'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export default async function PricingPage() {
  const t = await getTranslations('pricing')
  const messages = await getMessages()
  const m = messages.pricing as Record<string, unknown>
  const features = m.features as string[]
  const examples = m.examples as { n: number; price: string }[]
  const faqs = m.faqs as { q: string; a: string }[]

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .pr-hero { padding: 48px 20px 32px !important; }
          .pr-card-wrap { padding: 0 20px !important; }
          .pr-faq { padding: 0 20px !important; }
          .pr-cta { padding: 60px 20px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <div className="pr-hero" style={{ textAlign: 'center', padding: '80px 40px 56px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          {t('badge')}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, lineHeight: 1.12, marginBottom: 16, color: '#0f0f0e' }}>
          {t('title1')}<br /><em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('em')}</em>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', marginBottom: 0 }}>
          {t('subtitle')}
        </p>
      </div>

      {/* Pricing card */}
      <div className="pr-card-wrap" style={{ maxWidth: 480, margin: '0 auto 80px', padding: '0 40px' }}>
        <div style={{ background: 'white', border: '2px solid #1a5fd4', borderRadius: 20, padding: '40px 36px', textAlign: 'center', position: 'relative', boxShadow: '0 4px 32px rgba(26,95,212,.10)' }}>
          <div style={{ display: 'inline-block', background: '#1a5fd4', color: 'white', fontSize: 11, fontWeight: 500, padding: '4px 16px', borderRadius: 20, marginBottom: 24 }}>
            {t('trial')}
          </div>

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 64, fontWeight: 400, color: '#0f0f0e', lineHeight: 1 }}>{t('price')}</span>
          </div>
          <div style={{ fontSize: 15, color: '#7a7a78', marginBottom: 32 }}>{t('perMonth')}</div>

          <div style={{ height: 1, background: '#e8e7e2', margin: '0 0 28px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#3a3a38' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e2f4eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: '#177a4a', fontWeight: 600 }}>✓</div>
                {f}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#3a3a38', marginTop: 4 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#e2f4eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: '#177a4a', fontWeight: 600 }}>✓</div>
              <strong>{t('featureExtra')}</strong>
            </div>
          </div>

          {/* Examples */}
          <div style={{ background: '#f2f1ed', borderRadius: 12, padding: '16px 20px', marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: '#7a7a78', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 10 }}>{t('examplesLabel')}</p>
            {examples.map(({ n, price }) => (
              <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#3a3a38', padding: '5px 0', borderBottom: '1px solid #e8e7e2' }}>
                <span>{n} {t('newEmployees')}</span>
                <span style={{ fontWeight: 600, color: '#0f0f0e' }}>{price}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#b8b8b5', marginTop: 10 }}>{t('examplesNote')}</p>
          </div>

          <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: 'none', background: '#1a5fd4', color: 'white' }}>
            {t('cta')}
          </Link>

          <p style={{ fontSize: 12, color: '#b8b8b5', marginTop: 16 }}>
            {t('note')}
          </p>
        </div>

        {/* Enterprise */}
        <div style={{ background: 'white', border: '1px solid #e8e7e2', borderRadius: 16, padding: '24px 28px', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0e', marginBottom: 4 }}>{t('enterprise.title')}</div>
            <div style={{ fontSize: 13, color: '#7a7a78' }}>{t('enterprise.desc')}</div>
          </div>
          <Link href="/contact" style={{ fontSize: 13, fontWeight: 500, color: '#1a5fd4', border: '1px solid #c8d8f8', padding: '8px 18px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {t('enterprise.cta')}
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="pr-faq" style={{ maxWidth: 700, margin: '0 auto 80px', padding: '0 40px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#0f0f0e', marginBottom: 40, textAlign: 'center' }}>
          {t('faqTitle1')} <em style={{ fontStyle: 'italic', color: '#1a5fd4' }}>{t('faqEm')}</em>
        </h2>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderBottom: '1px solid #e8e7e2', padding: '20px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0e', marginBottom: 8 }}>{faq.q}</div>
            <div style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.6, fontWeight: 300 }}>{faq.a}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section className="pr-cta" style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: 'white', marginBottom: 16 }}>{t('ctaSection.title')}</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,.8)', fontWeight: 300, maxWidth: 440, margin: '0 auto 32px' }}>{t('ctaSection.subtitle')}</p>
        <Link href="/signup" style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          {t('ctaSection.btn')}
        </Link>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
