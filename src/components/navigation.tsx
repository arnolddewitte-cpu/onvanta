'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

type Role = 'employee' | 'manager' | 'company_admin' | 'super_admin'

interface Props {
  role?: Role
}

export default function Navigation({ role = 'employee' }: Props) {
  const t = useTranslations('app')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const navConfig = {
    employee: [
      { href: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
      { href: '/onboarding', label: t('nav.onboarding'), icon: '📋' },
      { href: '/tasks', label: t('nav.tasks'), icon: '✅' },
      { href: '/flashcards', label: t('nav.flashcards'), icon: '🃏' },
    ],
    manager: [
      { href: '/manager', label: t('nav.team'), icon: '👥' },
      { href: '/manager/approvals', label: t('nav.approvals'), icon: '✓' },
    ],
    company_admin: [
      { href: '/admin', label: t('nav.dashboard'), icon: '🏠' },
      { href: '/admin/templates', label: t('nav.templates'), icon: '📋' },
      { href: '/admin/users', label: t('nav.users'), icon: '👥' },
      { href: '/admin/settings', label: t('nav.settings'), icon: '⚙️' },
    ],
    super_admin: [
      { href: '/super', label: t('nav.dashboard'), icon: '🏠' },
    ],
  }

  const items = navConfig[role] ?? navConfig.employee

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function switchLocale(next: string) {
    document.cookie = `ONVANTA_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    const path = window.location.pathname
    if (next === 'en' && !path.startsWith('/en')) {
      window.location.href = '/en' + (path === '/' ? '' : path)
    } else if (next === 'nl') {
      window.location.href = path.startsWith('/en/')
        ? path.slice(3)
        : path === '/en' ? '/' : path
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">O</span>
            </div>
            <span className="font-semibold text-gray-900">Onvanta</span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Language switcher + role + logout */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          {/* Help link */}
          <Link
            href="/help"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === '/help'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-base flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs font-bold leading-none">?</span>
            {t('help.navLabel')}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-1 px-3 py-2 mb-1">
            <button
              onClick={() => switchLocale('nl')}
              className={`text-sm px-2 py-1 rounded-lg transition-colors ${
                locale === 'nl'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🇳🇱 NL
            </button>
            <span className="text-gray-200 text-xs">/</span>
            <button
              onClick={() => switchLocale('en')}
              className={`text-sm px-2 py-1 rounded-lg transition-colors ${
                locale === 'en'
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <p className="text-xs text-gray-400 px-3 mb-2">{t(`nav.roles.${role}`)}</p>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full disabled:opacity-50"
          >
            <span className="text-base">↩</span>
            {loggingOut ? t('nav.loggingOut') : t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 px-2 py-2">
        <div className="flex justify-around">
          {items.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-gray-400 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">↩</span>
            <span className="text-xs font-medium">{t('nav.logout')}</span>
          </button>
        </div>
      </nav>
    </>
  )
}
