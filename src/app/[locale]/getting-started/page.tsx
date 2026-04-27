import Link from 'next/link'
import { getTranslations, getMessages } from 'next-intl/server'
import { seoMeta, ogImage } from '@/lib/seo'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const m = seoMeta[isEn ? 'en' : 'nl'].gettingStarted
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://onvanta.io${isEn ? '/en/getting-started' : '/getting-started'}` },
    openGraph: { title: m.title, description: m.description, images: [ogImage] },
  }
}

export default async function GettingStartedPage() {
  const t = await getTranslations('gettingStarted')
  const messages = await getMessages()
  const m = messages.gettingStarted as Record<string, unknown>
  const steps = m.steps as { icon: string; title: string; text: string }[]
  const cta = m.cta as { label: string; btn: string }

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .gs-hero { padding: 48px 20px 40px !important; }
          .gs-steps { padding: 0 20px 80px !important; }
          .gs-cta { padding: 60px 20px !important; }
          .gs-step-row { gap: 16px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="gs-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          {t('badge')}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', marginBottom: 16 }}>
          {t('title')}
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          {t('subtitle')}
        </p>
      </section>

      {/* Steps */}
      <section className="gs-steps" style={{ maxWidth: 680, margin: '0 auto', padding: '0 40px 96px' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical connector line */}
          <div style={{ position: 'absolute', left: 23, top: 0, bottom: 48, width: 1, background: '#e8e7e2' }} />

          {steps.map((step, i) => (
            <div
              key={i}
              className="gs-step-row"
              style={{ display: 'flex', gap: 24, marginBottom: i < steps.length - 1 ? 40 : 0, position: 'relative' }}
            >
              {/* Step indicator */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#1a5fd4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                  border: '3px solid #faf9f6',
                  boxShadow: '0 0 0 1px #e8e7e2',
                }}>
                  {step.icon}
                </div>
              </div>

              {/* Content card */}
              <div style={{ flex: 1, background: 'white', border: '1px solid #e8e7e2', borderRadius: 16, padding: '20px 24px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '2px 8px', borderRadius: 20 }}>
                    {i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </span>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 400, color: '#0f0f0e', margin: 0, lineHeight: 1.3 }}>
                    {step.title}
                  </h2>
                </div>
                <p style={{ fontSize: 14, color: '#3a3a38', lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gs-cta" style={{ background: '#1a5fd4', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: 'white', marginBottom: 32 }}>
          {cta.label}
        </h2>
        <Link
          href="/signup"
          style={{ fontSize: 16, fontWeight: 500, color: '#1a5fd4', background: 'white', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}
        >
          {cta.btn}
        </Link>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
