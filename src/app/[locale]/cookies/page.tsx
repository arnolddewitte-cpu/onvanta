import { seoMeta, ogImage } from '@/lib/seo'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale === 'en' ? 'en' : 'nl'
  const m = seoMeta[l].cookies
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://onvanta.io${l === 'en' ? '/en/cookies' : '/cookies'}` },
    openGraph: { title: m.title, description: m.description, images: [ogImage] },
  }
}

interface Section { title: string; content: string | string[] }

const sectionsNl: Section[] = [
  {
    title: '1. Wat zijn cookies',
    content: 'Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je onze website bezoekt. Ze helpen ons de website goed te laten werken en je gebruik te begrijpen.',
  },
  {
    title: '2. Welke cookies we gebruiken',
    content: [
      'Functionele cookies (noodzakelijk): inlogstatus, sessiebeheer, taalvoorkeur (ONVANTA_LOCALE). Geen toestemming vereist.',
      'Analytische cookies (optioneel): anoniem bezoekersgedrag. Alleen geplaatst met toestemming.',
      'Wij gebruiken GEEN tracking- of advertentiecookies.',
    ],
  },
  {
    title: '3. Cookies van derden',
    content: [
      'Stripe: betalingsverwerking (functioneel)',
      'Vercel: hosting en performance (functioneel)',
    ],
  },
  {
    title: '4. Cookie-instellingen beheren',
    content: 'Je kunt cookies beheren via je browserinstellingen. Het uitschakelen van functionele cookies kan de werking van het platform beïnvloeden.',
  },
  {
    title: '5. Contact',
    content: 'Vragen over ons cookiebeleid? Mail naar privacy@onvanta.io',
  },
]

const sectionsEn: Section[] = [
  {
    title: '1. What are cookies',
    content: 'Cookies are small text files stored on your device when you visit our website. They help us keep the website functioning properly and understand how you use it.',
  },
  {
    title: '2. Which cookies we use',
    content: [
      'Functional cookies (necessary): login status, session management, language preference (ONVANTA_LOCALE). No consent required.',
      'Analytical cookies (optional): anonymous visitor behaviour. Only placed with consent.',
      'We do NOT use tracking or advertising cookies.',
    ],
  },
  {
    title: '3. Third-party cookies',
    content: [
      'Stripe: payment processing (functional)',
      'Vercel: hosting and performance (functional)',
    ],
  },
  {
    title: '4. Managing cookie settings',
    content: 'You can manage cookies through your browser settings. Disabling functional cookies may affect the functioning of the platform.',
  },
  {
    title: '5. Contact',
    content: 'Questions about our cookie policy? Email privacy@onvanta.io',
  },
]

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const sections = isEn ? sectionsEn : sectionsNl

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <MarketingNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
            {isEn ? 'Legal' : 'Juridisch'}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 12 }}>
            {isEn ? 'Cookie Policy' : 'Cookiebeleid'}
          </h1>
          <p style={{ fontSize: 14, color: '#7a7a78' }}>
            {isEn ? 'Last updated: April 2026' : 'Laatst bijgewerkt: april 2026'}
          </p>
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#0f0f0e', marginBottom: 12 }}>
              {section.title}
            </h2>
            {Array.isArray(section.content) ? (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {section.content.map((item, j) => (
                  <li key={j} style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.8, fontWeight: 300, marginBottom: 6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.8, fontWeight: 300 }}>
                {section.content}
              </p>
            )}
          </div>
        ))}
      </div>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
