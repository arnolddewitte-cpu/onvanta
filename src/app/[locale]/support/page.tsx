import Link from 'next/link'
import { seoMeta, ogImage } from '@/lib/seo'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const { title, description } = isEn ? seoMeta.en.support : seoMeta.nl.support
  return {
    title,
    description,
    alternates: { canonical: `https://onvanta.io${isEn ? '/en/support' : '/support'}` },
    openGraph: { title, description, images: [ogImage] },
  }
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'

  const cards = isEn
    ? [
        {
          icon: '📚',
          title: 'Knowledge base',
          desc: 'Step-by-step articles on every feature — for employees, managers and admins.',
          label: 'Browse articles →',
          href: '/help',
        },
        {
          icon: '❓',
          title: 'FAQ',
          desc: 'Quick answers to the most common questions about Onvanta, pricing and privacy.',
          label: 'View FAQ →',
          href: '/faq',
        },
        {
          icon: '💬',
          title: 'Contact us',
          desc: 'Can\'t find what you\'re looking for? Send us a message. Response within 1 business day.',
          label: 'Get in touch →',
          href: '/contact',
        },
      ]
    : [
        {
          icon: '📚',
          title: 'Kennisbank',
          desc: 'Stap-voor-stap artikelen over elke functie — voor medewerkers, managers en admins.',
          label: 'Bekijk artikelen →',
          href: '/help',
        },
        {
          icon: '❓',
          title: 'FAQ',
          desc: 'Snelle antwoorden op de meest gestelde vragen over Onvanta, prijzen en privacy.',
          label: 'Naar de FAQ →',
          href: '/faq',
        },
        {
          icon: '💬',
          title: 'Contact',
          desc: 'Niet gevonden wat je zocht? Stuur ons een bericht. Reactie binnen 1 werkdag.',
          label: 'Neem contact op →',
          href: '/contact',
        },
      ]

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .support-hero { padding: 48px 20px 40px !important; }
          .support-body { padding: 0 20px 80px !important; }
          .support-grid { grid-template-columns: 1fr !important; }
        }
        .support-card { transition: box-shadow .15s; }
        .support-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07); }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="support-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          Support
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', marginBottom: 16 }}>
          {isEn ? 'How can we help?' : 'Hoe kunnen we helpen?'}
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          {isEn
            ? 'Browse the knowledge base, check the FAQ or reach out directly.'
            : 'Bekijk de kennisbank, de veelgestelde vragen of neem direct contact op.'}
        </p>
      </section>

      {/* Cards */}
      <section className="support-body" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px 100px' }}>
        <div className="support-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {cards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="support-card" style={{ background: '#fff', border: '1px solid #e8e7e2', borderRadius: 20, padding: '32px 28px', height: '100%' }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>{card.icon}</div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: '#0f0f0e', marginBottom: 10, lineHeight: 1.3 }}>
                  {card.title}
                </h2>
                <p style={{ fontSize: 14, color: '#5a5a58', lineHeight: 1.7, marginBottom: 20 }}>
                  {card.desc}
                </p>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1a5fd4' }}>
                  {card.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
