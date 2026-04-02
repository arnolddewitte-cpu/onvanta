'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

type Role = 'employee' | 'manager' | 'company_admin' | 'super_admin'

interface Props {
  role?: Role
}

const navConfig = {
  employee: [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/onboarding', label: 'Onboarding', icon: '📋' },
    { href: '/tasks', label: 'Taken', icon: '✅' },
    { href: '/flashcards', label: 'Flashcards', icon: '🃏' },
  ],
  manager: [
    { href: '/manager', label: 'Team', icon: '👥' },
    { href: '/manager/approvals', label: 'Goedkeuringen', icon: '✓' },
  ],
  company_admin: [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/templates', label: 'Templates', icon: '📋' },
    { href: '/admin/users', label: 'Gebruikers', icon: '👥' },
    { href: '/admin/settings', label: 'Instellingen', icon: '⚙️' },
  ],
  super_admin: [
    { href: '/super', label: 'Dashboard', icon: '🏠' },
  ],
}

const roleLabel: Record<Role, string> = {
  employee: 'Medewerker',
  manager: 'Manager',
  company_admin: 'Admin',
  super_admin: 'Super Admin',
}

export default function Navigation({ role = 'employee' }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const items = navConfig[role] ?? navConfig.employee

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
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

        {/* Rol badge + uitloggen */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <p className="text-xs text-gray-400 px-3 mb-2">{roleLabel[role]}</p>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors w-full disabled:opacity-50"
          >
            <span className="text-base">↩</span>
            {loggingOut ? 'Uitloggen...' : 'Uitloggen'}
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
            <span className="text-xs font-medium">Uitloggen</span>
          </button>
        </div>
      </nav>
    </>
  )
}
