'use client'

import { useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import { Link } from '@/i18n/routing'
import MarketingNav from '@/components/marketing-nav'
import MarketingFooter from '@/components/marketing-footer'
import CookieBanner from '@/components/cookie-banner'

type FaqItem = { q: string; a: string }
type FaqCategory = { title: string; items: FaqItem[] }

export default function FaqPage() {
  const t = useTranslations('faq')
  const messages = useMessages()
  const categories = ((messages.faq as Record<string, unknown>).categories) as FaqCategory[]
  const [open, setOpen] = useState<string | null>(null)

  function toggle(key: string) {
    setOpen(prev => prev === key ? null : key)
  }

  return (
    <main style={{ background: '#faf9f6', fontFamily: 'DM Sans, system-ui, sans-serif', minHeight: '100vh' }}>
      <MarketingNav />

      {/* Hero */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(60px, 8vw, 100px) 24px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 500, letterSpacing: '.8px', textTransform: 'uppercase', color: '#1a5fd4', background: '#e8f0fc', padding: '5px 14px', borderRadius: 20, marginBottom: 24 }}>
          {t('badge')}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, lineHeight: 1.15, color: '#0f0f0e', margin: '0 0 48px' }}>
          {t('title')}
        </h1>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        {categories.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 48 }}>
            {/* Category heading */}
            <div style={{ paddingBottom: 12, marginBottom: 4, borderBottom: '1.5px solid #e8e7e2' }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', color: '#7a7a78', margin: 0 }}>
                {cat.title}
              </h2>
            </div>

            {/* Accordion items */}
            {cat.items.map((item, qi) => {
              const key = `${ci}-${qi}`
              const isOpen = open === key
              return (
                <div key={qi} style={{ borderBottom: '1px solid #f0ede8' }}>
                  <button
                    onClick={() => toggle(key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, system-ui, sans-serif' }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#0f0f0e', lineHeight: 1.4 }}>
                      {item.q}
                    </span>
                    <span style={{ fontSize: 18, color: '#7a7a78', flexShrink: 0, transition: 'transform .2s', display: 'block', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ paddingBottom: 20, paddingRight: 32 }}>
                      <p style={{ fontSize: 15, color: '#3a3a38', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* CTA */}
        <div style={{ marginTop: 16, textAlign: 'center', padding: '40px 32px', background: 'white', borderRadius: 20, border: '1px solid #e8e7e2' }}>
          <Link
            href="/contact"
            style={{ fontSize: 15, fontWeight: 500, color: '#1a5fd4', textDecoration: 'none' }}
          >
            {t('cta')}
          </Link>
        </div>
      </div>

      <MarketingFooter />
      <CookieBanner />
    </main>
  )
}
