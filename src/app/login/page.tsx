'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('app.login')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setStatus('sent')
    } else {
      setStatus('error')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold text-lg">O</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t('subtitle')}</p>
        </div>

        {status === 'sent' ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('sentTitle')}</h2>
            <p className="text-gray-500 text-sm">{t('sentText', { email })}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                style={{ color: '#0f0f0e' }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm mb-4">{t('error')}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? t('submitting') : t('submit')}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          {t('footer')}
        </p>
      </div>
    </main>
  )
}
