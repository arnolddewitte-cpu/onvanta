import { getTranslations, getMessages } from 'next-intl/server'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')
  const messages = await getMessages()
  const sections = ((messages.privacy as Record<string, unknown>).sections) as { title: string; content: string }[]

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>

      <MarketingNav />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 12px', borderRadius: 20, marginBottom: 20 }}>
            {t('badge')}
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.12, color: '#0f0f0e', marginBottom: 12 }}>{t('title')}</h1>
          <p style={{ fontSize: 14, color: '#7a7a78' }}>{t('updated')}</p>
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 400, color: '#0f0f0e', marginBottom: 12 }}>{section.title}</h2>
            <p style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.8, fontWeight: 300 }}>{section.content}</p>
          </div>
        ))}
      </div>

      <MarketingFooter />
    </main>
  )
}
