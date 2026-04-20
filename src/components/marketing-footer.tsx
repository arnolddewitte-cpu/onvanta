'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function MarketingFooter() {
  const t = useTranslations('common.footer')

  const cols = [
    { title: t('product'), links: [{ label: t('features'), href: '/#functies' }, { label: t('pricing'), href: '/pricing' }] },
    { title: t('company'), links: [{ label: t('about'), href: '/about' }, { label: t('contact'), href: '/contact' }] },
    { title: t('legal'), links: [{ label: t('privacy'), href: '/privacy' }, { label: t('terms'), href: '/terms' }] },
  ]

  return (
    <footer className="overflow-hidden" style={{ background: '#0f0f0e' }}>
      <div className="max-w-[1100px] mx-auto px-5 pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div style={{ width: 30, height: 30, background: '#1a5fd4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>O</div>
              <span className="text-base font-medium text-white">Onvanta</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: '#7a7a78' }}>{t('tagline')}</p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <h4 className="text-[13px] font-medium text-white mb-4">{col.title}</h4>
              {col.links.map((l, j) => (
                <div key={j} className="mb-2.5">
                  <Link href={l.href} className="text-sm no-underline hover:text-white transition-colors" style={{ color: '#7a7a78' }}>{l.label}</Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row sm:justify-between gap-2 text-[13px]" style={{ borderColor: '#1a1a1a', color: '#7a7a78' }}>
          <span>{t('copyright')}</span>
          <span>{t('madeIn')}</span>
        </div>
      </div>
    </footer>
  )
}
