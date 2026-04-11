'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/routing'

export default function MarketingNav() {
  const t = useTranslations('common.nav')
  const locale = useLocale()
  const pathname = usePathname() // always locale-stripped by next-intl
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const links = [
    { href: t('featuresHref') as '/', label: t('features') },
    { href: '/pricing' as const, label: t('pricing') },
    { href: '/about' as const, label: t('about') },
    { href: '/contact' as const, label: t('contact') },
    { href: '/faq' as const, label: t('faq') },
  ]

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return pathname === '/'
    return pathname === href
  }

  function switchLocale(next: 'nl' | 'en') {
    if (next === locale) return
    router.replace(pathname as '/', { locale: next })
  }

  const LangButton = ({ code, flag }: { code: 'nl' | 'en'; flag: string }) => (
    <button
      onClick={() => switchLocale(code)}
      style={{
        background: 'none',
        border: 'none',
        cursor: code === locale ? 'default' : 'pointer',
        fontSize: 16,
        lineHeight: 1,
        padding: '2px 4px',
        borderRadius: 4,
        opacity: code === locale ? 1 : 0.45,
        fontWeight: code === locale ? 700 : 400,
        transition: 'opacity .15s',
      }}
      aria-label={code === 'nl' ? 'Nederlands' : 'English'}
      aria-pressed={code === locale}
    >
      {flag}
    </button>
  )

  return (
    <>
      <style>{`
        .mnav-links { display: flex; align-items: center; gap: 32px; }
        .mnav-cta { display: flex; gap: 10px; align-items: center; }
        .mnav-hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .mnav-links { display: none; }
          .mnav-cta { display: none; }
          .mnav-hamburger { display: flex; flex-direction: column; gap: 5px; }
        }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,249,246,.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e7e2', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0e' }}>Onvanta</span>
        </Link>

        <div className="mnav-links">
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: 14, color: isActive(link.href) ? '#0f0f0e' : '#3a3a38', fontWeight: isActive(link.href) ? 500 : 400, textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mnav-cta">
          {/* Language switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 8 }}>
            <LangButton code="nl" flag="🇳🇱" />
            <LangButton code="en" flag="🇬🇧" />
          </div>
          <Link href="/login" style={{ fontSize: 14, color: '#3a3a38', textDecoration: 'none', padding: '7px 14px' }}>{t('login')}</Link>
          <Link href="/signup" style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '8px 18px', borderRadius: 10, textDecoration: 'none' }}>{t('cta')}</Link>
        </div>

        <button className="mnav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: '#0f0f0e', borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(250,249,246,.98)', display: 'flex', flexDirection: 'column', padding: '80px 24px 40px' }}>
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 18, right: 20, background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: '#0f0f0e', lineHeight: 1 }}>×</button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{ fontSize: 22, fontWeight: 400, color: '#0f0f0e', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid #e8e7e2' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Mobile language switcher */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '8px 0' }}>
              <button onClick={() => { switchLocale('nl'); setOpen(false) }} style={{ background: 'none', border: locale === 'nl' ? '1.5px solid #1a5fd4' : '1px solid #e8e7e2', borderRadius: 8, padding: '8px 20px', fontSize: 15, cursor: locale === 'nl' ? 'default' : 'pointer', fontWeight: locale === 'nl' ? 600 : 400, color: locale === 'nl' ? '#1a5fd4' : '#3a3a38' }}>
                🇳🇱 Nederlands
              </button>
              <button onClick={() => { switchLocale('en'); setOpen(false) }} style={{ background: 'none', border: locale === 'en' ? '1.5px solid #1a5fd4' : '1px solid #e8e7e2', borderRadius: 8, padding: '8px 20px', fontSize: 15, cursor: locale === 'en' ? 'default' : 'pointer', fontWeight: locale === 'en' ? 600 : 400, color: locale === 'en' ? '#1a5fd4' : '#3a3a38' }}>
                🇬🇧 English
              </button>
            </div>
            <Link href="/login" onClick={() => setOpen(false)} style={{ fontSize: 16, color: '#3a3a38', textDecoration: 'none', padding: '13px 0', textAlign: 'center', border: '1px solid #e8e7e2', borderRadius: 12 }}>
              {t('login')}
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} style={{ fontSize: 16, fontWeight: 500, color: 'white', background: '#1a5fd4', padding: '13px 0', borderRadius: 12, textDecoration: 'none', textAlign: 'center' }}>
              {t('cta')}
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
