import { seoMeta, ogImage } from '@/lib/seo'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l = locale === 'en' ? 'en' : 'nl'
  const m = seoMeta[l].dpa
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://onvanta.io${l === 'en' ? '/en/dpa' : '/dpa'}` },
    openGraph: { title: m.title, description: m.description, images: [ogImage] },
  }
}

interface Section { title: string; content: string | string[] }

const sectionsNl: Section[] = [
  {
    title: '1. Inleiding',
    content: 'Deze verwerkersovereenkomst (DPA) is van toepassing tussen Onvanta (verwerker) en de klant (verwerkingsverantwoordelijke) die gebruik maakt van het Onvanta platform. Deze overeenkomst voldoet aan de vereisten van de AVG (Algemene Verordening Gegevensbescherming).',
  },
  {
    title: '2. Definities',
    content: [
      'Verwerkingsverantwoordelijke: het bedrijf dat Onvanta gebruikt voor medewerkeronboarding',
      'Verwerker: Onvanta, gevestigd in Nederland',
      'Betrokkenen: medewerkers van de verwerkingsverantwoordelijke',
      'Persoonsgegevens: naam, e-mailadres, onboardingvoortgang, quizresultaten',
    ],
  },
  {
    title: '3. Doeleinden van verwerking',
    content: 'Onvanta verwerkt persoonsgegevens uitsluitend ten behoeve van het leveren van de onboardingdienst: het beheren van onboardingtrajecten, het bijhouden van voortgang en quizresultaten, en het versturen van systeemgerelateerde e-mails.',
  },
  {
    title: '4. Verplichtingen van Onvanta als verwerker',
    content: [
      'Wij verwerken gegevens alleen op instructie van de verwerkingsverantwoordelijke',
      'Wij treffen passende technische en organisatorische beveiligingsmaatregelen',
      'Wij informeren de verwerkingsverantwoordelijke bij een datalek binnen 48 uur',
      'Wij verwijderen of retourneren alle persoonsgegevens na beëindiging van de overeenkomst',
      'Wij schakelen geen sub-verwerkers in zonder voorafgaande toestemming',
    ],
  },
  {
    title: '5. Sub-verwerkers',
    content: [
      'Supabase (database, VS/EU) — opslag van gebruikersgegevens',
      'Vercel (hosting, VS/EU) — platformhosting',
      'Resend (e-mail, VS) — transactionele e-mails',
      'Stripe (betalingen, VS/EU) — betalingsverwerking',
      'Anthropic (AI, VS) — AI-gegenereerde template content (geen persoonsgegevens)',
    ],
  },
  {
    title: '6. Bewaartermijnen',
    content: 'Persoonsgegevens worden bewaard zolang de klantrelatie actief is. Na opzegging worden gegevens binnen 30 dagen verwijderd, tenzij wettelijke bewaarplicht van toepassing is.',
  },
  {
    title: '7. Rechten van betrokkenen',
    content: 'De verwerkingsverantwoordelijke is verantwoordelijk voor het afhandelen van verzoeken van betrokkenen (inzage, correctie, verwijdering). Onvanta ondersteunt hierbij op verzoek.',
  },
  {
    title: '8. Toepasselijk recht',
    content: 'Deze overeenkomst is onderworpen aan Nederlands recht. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.',
  },
  {
    title: '9. Contact',
    content: 'Voor vragen over deze verwerkersovereenkomst: privacy@onvanta.io',
  },
]

const sectionsEn: Section[] = [
  {
    title: '1. Introduction',
    content: 'This Data Processing Agreement (DPA) applies between Onvanta (processor) and the customer (controller) using the Onvanta platform. This agreement complies with the requirements of the GDPR (General Data Protection Regulation).',
  },
  {
    title: '2. Definitions',
    content: [
      'Controller: the company using Onvanta for employee onboarding',
      'Processor: Onvanta, established in the Netherlands',
      'Data subjects: employees of the controller',
      'Personal data: name, email address, onboarding progress, quiz results',
    ],
  },
  {
    title: '3. Purposes of processing',
    content: 'Onvanta processes personal data solely for the purpose of providing the onboarding service: managing onboarding programmes, tracking progress and quiz results, and sending system-related emails.',
  },
  {
    title: '4. Obligations of Onvanta as processor',
    content: [
      'We process data only on the instructions of the controller',
      'We implement appropriate technical and organisational security measures',
      'We notify the controller of a data breach within 48 hours',
      'We delete or return all personal data upon termination of the agreement',
      'We do not engage sub-processors without prior consent',
    ],
  },
  {
    title: '5. Sub-processors',
    content: [
      'Supabase (database, US/EU) — user data storage',
      'Vercel (hosting, US/EU) — platform hosting',
      'Resend (email, US) — transactional emails',
      'Stripe (payments, US/EU) — payment processing',
      'Anthropic (AI, US) — AI-generated template content (no personal data)',
    ],
  },
  {
    title: '6. Retention periods',
    content: 'Personal data is retained for as long as the customer relationship is active. After termination, data is deleted within 30 days, unless a statutory retention obligation applies.',
  },
  {
    title: '7. Rights of data subjects',
    content: 'The controller is responsible for handling requests from data subjects (access, rectification, erasure). Onvanta provides assistance upon request.',
  },
  {
    title: '8. Governing law',
    content: 'This agreement is governed by Dutch law. Disputes shall be submitted to the competent court in the Netherlands.',
  },
  {
    title: '9. Contact',
    content: 'For questions about this Data Processing Agreement: privacy@onvanta.io',
  },
]

export default async function DpaPage({ params }: { params: Promise<{ locale: string }> }) {
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
            {isEn ? 'Data Processing Agreement' : 'Verwerkersovereenkomst'}
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
