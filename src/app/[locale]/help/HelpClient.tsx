'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type Role = 'employee' | 'manager' | 'company_admin' | 'super_admin'

interface Article {
  key: string
  category: 'employee' | 'manager' | 'admin'
  icon: string
  roles: Role[]
}

// Defines which articles exist, their category, icon, and which roles see them.
// Text comes from locales/*/app.json → help.articles.*
const ARTICLES: Article[] = [
  // Employee articles
  { key: 'howOnboarding',    category: 'employee', icon: '📋', roles: ['employee', 'manager', 'company_admin'] },
  { key: 'howFlashcards',    category: 'employee', icon: '🃏', roles: ['employee', 'manager', 'company_admin'] },
  { key: 'howTasks',         category: 'employee', icon: '✅', roles: ['employee', 'manager', 'company_admin'] },
  { key: 'whatIsAtRisk',     category: 'employee', icon: '⚠️', roles: ['employee', 'manager', 'company_admin'] },
  { key: 'howCertificate',   category: 'employee', icon: '🎓', roles: ['employee', 'manager', 'company_admin'] },
  // Manager articles
  { key: 'howStartOnboarding', category: 'manager', icon: '🚀', roles: ['manager', 'company_admin'] },
  { key: 'howInvite',          category: 'manager', icon: '✉️', roles: ['manager', 'company_admin'] },
  { key: 'howAtRiskManager',   category: 'manager', icon: '🔔', roles: ['manager', 'company_admin'] },
  { key: 'howApproval',        category: 'manager', icon: '👍', roles: ['manager', 'company_admin'] },
  { key: 'howDigest',          category: 'manager', icon: '📧', roles: ['manager', 'company_admin'] },
  // Admin articles
  { key: 'howTemplate',    category: 'admin', icon: '🗂️', roles: ['company_admin'] },
  { key: 'howLibrary',     category: 'admin', icon: '📚', roles: ['company_admin'] },
  { key: 'howAI',          category: 'admin', icon: '✨', roles: ['company_admin'] },
  { key: 'howBranding',    category: 'admin', icon: '🎨', roles: ['company_admin'] },
  { key: 'howBilling',     category: 'admin', icon: '💳', roles: ['company_admin'] },
  { key: 'howPauseDelete', category: 'admin', icon: '⚙️', roles: ['company_admin'] },
]

const CATEGORY_ICONS: Record<string, string> = {
  employee: '👤',
  manager:  '👥',
  admin:    '⚙️',
}

interface Props {
  role: Role
}

export default function HelpClient({ role }: Props) {
  const t = useTranslations('app.help')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openArticle, setOpenArticle] = useState<string | null>(null)

  // Which articles this role can see (super_admin sees everything company_admin sees)
  const effectiveRole = role === 'super_admin' ? 'company_admin' : role
  const visible = useMemo(
    () => ARTICLES.filter(a => a.roles.includes(effectiveRole)),
    [effectiveRole]
  )

  // Which categories exist for this role
  const categories = useMemo(() => {
    const seen = new Set<string>()
    return visible.reduce<string[]>((acc, a) => {
      if (!seen.has(a.category)) { seen.add(a.category); acc.push(a.category) }
      return acc
    }, [])
  }, [visible])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return visible.filter(a => {
      const title = t(`articles.${a.key}.title` as Parameters<typeof t>[0]).toLowerCase()
      const body  = t(`articles.${a.key}.body`  as Parameters<typeof t>[0]).toLowerCase()
      const matchesSearch = !q || title.includes(q) || body.includes(q)
      const matchesCat = !activeCategory || a.category === activeCategory
      return matchesSearch && matchesCat
    })
  }, [visible, search, activeCategory, t])

  function toggle(key: string) {
    setOpenArticle(prev => prev === key ? null : key)
  }

  // Group filtered articles by category for display
  const byCategory = useMemo(() => {
    const map = new Map<string, Article[]>()
    for (const a of filtered) {
      if (!map.has(a.category)) map.set(a.category, [])
      map.get(a.category)!.push(a)
    }
    return map
  }, [filtered])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('pageTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('pageSubtitle')}</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveCategory(null) }}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div className="flex gap-6 items-start">

          {/* Category sidebar */}
          <aside className="hidden md:block w-48 flex-shrink-0 sticky top-8">
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveCategory(null); setSearch('') }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  !activeCategory && !search
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Alle artikelen
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setSearch('') }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeCategory === cat
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {t(`categories.${cat}` as Parameters<typeof t>[0])}
                </button>
              ))}
            </nav>
          </aside>

          {/* Articles */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                {t('noResults', { query: search })}
              </div>
            ) : (
              <div className="space-y-6">
                {[...byCategory.entries()].map(([cat, articles]) => (
                  <div key={cat}>
                    {/* Category heading — only show when not filtered to a single category */}
                    {(!activeCategory || byCategory.size > 1) && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                          {t(`categories.${cat}` as Parameters<typeof t>[0])}
                        </h2>
                      </div>
                    )}

                    <div className="space-y-2">
                      {articles.map(article => {
                        const isOpen = openArticle === article.key
                        const title = t(`articles.${article.key}.title` as Parameters<typeof t>[0])
                        const body  = t(`articles.${article.key}.body`  as Parameters<typeof t>[0])

                        return (
                          <div
                            key={article.key}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                          >
                            <button
                              onClick={() => toggle(article.key)}
                              className="w-full flex items-center gap-4 px-5 py-4 text-left"
                            >
                              <span className="text-xl flex-shrink-0">{article.icon}</span>
                              <span className="flex-1 text-sm font-medium text-gray-900">{title}</span>
                              <span className={`text-gray-400 text-sm transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                ▾
                              </span>
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5 border-t border-gray-50">
                                <div className="pt-4 space-y-3">
                                  {body.split('\n\n').map((para, i) => (
                                    <p key={i} className="text-sm text-gray-600 leading-relaxed">
                                      {para}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-2xl mb-2">💬</p>
              <Link
                href="/contact"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {t('cta')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
