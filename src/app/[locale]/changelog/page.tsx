import { seoMeta, ogImage } from '@/lib/seo'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const title = 'Changelog'
  const description = isEn
    ? 'All updates, improvements and fixes to Onvanta.'
    : 'Alle updates, verbeteringen en bugfixes van Onvanta.'
  return {
    title,
    description,
    alternates: { canonical: `https://onvanta.io${isEn ? '/en/changelog' : '/changelog'}` },
    openGraph: { title, description, images: [ogImage] },
  }
}

type Tag = 'Nieuw' | 'Verbeterd' | 'Bugfix' | 'New' | 'Improved' | 'Fix'

interface Entry {
  tag: Tag
  text: string
}

interface Release {
  version: string
  date: string
  items: Entry[]
}

const releasesNl: Release[] = [
  {
    version: 'v8.4',
    date: '23 april 2026',
    items: [
      { tag: 'Nieuw',     text: 'Blog gelanceerd met Contentful integratie — posts verschijnen automatisch zonder redeploy (ISR)' },
      { tag: 'Nieuw',     text: 'Cookiebeleid pagina (/cookies)' },
      { tag: 'Nieuw',     text: 'Verwerkersovereenkomst pagina (/dpa)' },
      { tag: 'Nieuw',     text: 'Support pagina (/support) met publiek helpcentrum' },
      { tag: 'Nieuw',     text: '/help nu publiek toegankelijk zonder inloggen' },
      { tag: 'Verbeterd', text: 'Homepage doelgroep verbreed — niet meer alleen logistiek/print maar elk groeiend bedrijf' },
      { tag: 'Verbeterd', text: 'Footer uitgebreid: Blog, Changelog, Cookiebeleid, Verwerkersovereenkomst, Support toegevoegd' },
      { tag: 'Verbeterd', text: 'Sitemap uitgebreid naar 28 URLs' },
    ],
  },
  {
    version: 'v8.3',
    date: '20 april 2026',
    items: [
      { tag: 'Nieuw',     text: 'Blog powered by Contentful — NL + EN, rich text, tags, leestijdschatting' },
      { tag: 'Verbeterd', text: 'ISR revalidate=60 op blog overzicht en post pagina\'s — nieuwe posts verschijnen zonder herdeployment' },
      { tag: 'Nieuw',     text: 'Cookiebeleid en Verwerkersovereenkomst (DPA) pagina\'s toegevoegd' },
      { tag: 'Nieuw',     text: 'Changelog pagina toegevoegd' },
    ],
  },
  {
    version: 'v8.2',
    date: '20 april 2026',
    items: [
      { tag: 'Verbeterd', text: 'Footer responsive op mobiel — overflow-hidden, px-5 padding, grid stapelt verticaal op 390px scherm' },
      { tag: 'Nieuw',     text: 'FAQ toegevoegd aan footer navigatie onder "Product"' },
    ],
  },
  {
    version: 'v8.1',
    date: '18 april 2026',
    items: [
      { tag: 'Nieuw',      text: 'Bedrijfs- en factuurgegevens in instellingen (contactpersoon, BTW, KVK, adres etc.)' },
      { tag: 'Verbeterd',  text: 'Afzender gewijzigd van noreply@ naar hello@onvanta.io' },
      { tag: 'Verbeterd',  text: 'Logo klik navigeert naar rol-specifieke homepage' },
      { tag: 'Nieuw',      text: 'Lege staat + welkomstbanner voor nieuwe accounts op het admin dashboard' },
      { tag: 'Bugfix',     text: 'Dashboard toonde data van alle bedrijven — nu gefilterd op companyId' },
      { tag: 'Bugfix',     text: 'Magic link rol was undefined door PostgREST join — opgelost met aparte user query' },
      { tag: 'Nieuw',      text: 'SEO metadata, canonical URLs en OG image op alle marketingpagina\'s' },
      { tag: 'Nieuw',      text: '"Geen mail ontvangen?" knop op de loginpagina' },
    ],
  },
]

const releasesEn: Release[] = [
  {
    version: 'v8.4',
    date: 'April 23, 2026',
    items: [
      { tag: 'New',      text: 'Blog launched with Contentful integration — posts appear automatically without redeployment (ISR)' },
      { tag: 'New',      text: 'Cookie Policy page (/cookies)' },
      { tag: 'New',      text: 'Data Processing Agreement page (/dpa)' },
      { tag: 'New',      text: 'Support page (/support) with public help centre' },
      { tag: 'New',      text: '/help now publicly accessible without logging in' },
      { tag: 'Improved', text: 'Homepage messaging broadened — no longer focused on logistics/print but every growing business' },
      { tag: 'Improved', text: 'Footer expanded: Blog, Changelog, Cookie Policy, DPA and Support added' },
      { tag: 'Improved', text: 'Sitemap expanded to 28 URLs' },
    ],
  },
  {
    version: 'v8.3',
    date: 'April 20, 2026',
    items: [
      { tag: 'New',      text: 'Contentful-powered blog — NL + EN, rich text, tags, read time estimate' },
      { tag: 'Improved', text: 'ISR revalidate=60 on blog overview and post pages — new posts appear without redeployment' },
      { tag: 'New',      text: 'Cookie Policy and Data Processing Agreement (DPA) pages added' },
      { tag: 'New',      text: 'Changelog page added' },
    ],
  },
  {
    version: 'v8.2',
    date: 'April 20, 2026',
    items: [
      { tag: 'Improved', text: 'Footer responsive on mobile — overflow-hidden, px-5 padding, grid stacks vertically on 390px screens' },
      { tag: 'New',      text: 'FAQ added to footer navigation under "Product"' },
    ],
  },
  {
    version: 'v8.1',
    date: 'April 18, 2026',
    items: [
      { tag: 'New',      text: 'Company and billing details in settings (contact person, VAT, KVK, address etc.)' },
      { tag: 'Improved', text: 'Sender address changed from noreply@ to hello@onvanta.io' },
      { tag: 'Improved', text: 'Logo click navigates to role-specific homepage' },
      { tag: 'New',      text: 'Empty state + welcome banner for new accounts on the admin dashboard' },
      { tag: 'Fix',      text: 'Dashboard showed data from all companies — now filtered by companyId' },
      { tag: 'Fix',      text: 'Magic link role was undefined due to PostgREST join — resolved with separate user query' },
      { tag: 'New',      text: 'SEO metadata, canonical URLs and OG image on all marketing pages' },
      { tag: 'New',      text: '"Didn\'t receive an email?" button on the login page' },
    ],
  },
]

const tagStyle: Record<Tag, { bg: string; color: string }> = {
  'Nieuw':     { bg: '#e8f0fc', color: '#1a5fd4' },
  'New':       { bg: '#e8f0fc', color: '#1a5fd4' },
  'Verbeterd': { bg: '#ecfdf5', color: '#059669' },
  'Improved':  { bg: '#ecfdf5', color: '#059669' },
  'Bugfix':    { bg: '#fff7ed', color: '#d97706' },
  'Fix':       { bg: '#fff7ed', color: '#d97706' },
}

export default async function ChangelogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === 'en'
  const releases = isEn ? releasesEn : releasesNl

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .cl-hero { padding: 48px 20px 40px !important; }
          .cl-body { padding: 0 20px 80px !important; }
        }
      `}</style>

      <MarketingNav />

      {/* Hero */}
      <section className="cl-hero" style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px 56px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
          {isEn ? 'What\'s new' : 'Wat is er nieuw'}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', marginBottom: 16 }}>
          {isEn ? 'Changelog' : 'Changelog'}
        </h1>
        <p style={{ fontSize: 17, fontWeight: 300, color: '#3a3a38', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          {isEn
            ? 'Every update, improvement and fix — in chronological order.'
            : 'Elke update, verbetering en bugfix — in chronologische volgorde.'}
        </p>
      </section>

      {/* Entries */}
      <section className="cl-body" style={{ maxWidth: 720, margin: '0 auto', padding: '0 40px 100px' }}>
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 0, top: 8, bottom: 0, width: 1, background: '#e8e7e2' }} />

          {releases.map((release, ri) => (
            <div key={ri} style={{ paddingLeft: 32, marginBottom: 56, position: 'relative' }}>
              {/* Dot */}
              <div style={{ position: 'absolute', left: -5, top: 6, width: 11, height: 11, borderRadius: '50%', background: '#1a5fd4', border: '2px solid #faf9f6' }} />

              {/* Version + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 400, color: '#0f0f0e' }}>
                  {release.version}
                </span>
                <span style={{ fontSize: 13, color: '#7a7a78' }}>{release.date}</span>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {release.items.map((item, ii) => (
                  <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '.4px',
                      textTransform: 'uppercase',
                      padding: '3px 9px',
                      borderRadius: 20,
                      marginTop: 1,
                      background: tagStyle[item.tag].bg,
                      color: tagStyle[item.tag].color,
                    }}>
                      {item.tag}
                    </span>
                    <span style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.6 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
