'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export default function CookieBanner() {
  const t = useTranslations('app.cookieBanner')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = localStorage.getItem('cookie-consent')
    if (!choice) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, width: 'calc(100% - 48px)', maxWidth: 560,
      background: 'white', border: '1px solid #e8e7e2', borderRadius: 16,
      boxShadow: '0 8px 40px rgba(0,0,0,.10)',
      padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 20,
      fontFamily: 'DM Sans, system-ui, sans-serif',
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0e', margin: '0 0 4px' }}>
          {t('title')}
        </p>
        <p style={{ fontSize: 13, color: '#7a7a78', margin: 0, fontWeight: 300, lineHeight: 1.5 }}>
          {t('text')}{' '}
          <a href="/privacy" style={{ color: '#1a5fd4', textDecoration: 'none' }}>{t('privacy')}</a>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #e8e7e2',
            background: 'transparent', fontSize: 13, fontWeight: 500, color: '#3a3a38',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('decline')}
        </button>
        <button
          onClick={accept}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: '#1a5fd4', fontSize: 13, fontWeight: 500, color: 'white',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('accept')}
        </button>
      </div>
    </div>
  )
}
