'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Stats {
  activeOnboardings: number
  completedThisMonth: number
  atRisk: number
  templates: number
}

interface Onboarding {
  id: string
  name: string
  role: string
  progress: number
  status: 'at_risk' | 'on_track'
  phase: string
}

export default function AdminPage() {
  const t = useTranslations('app')
  const router = useRouter()

  const [stats, setStats] = useState<Stats>({ activeOnboardings: 0, completedThisMonth: 0, atRisk: 0, templates: 0 })
  const [recentOnboardings, setRecentOnboardings] = useState<Onboarding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(data => {
        if (data.stats) setStats(data.stats)
        if (data.recentOnboardings) setRecentOnboardings(data.recentOnboardings)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalOnboardings = stats.activeOnboardings + stats.completedThisMonth

  const quickActions = [
    { label: t('admin.startOnboarding'),  icon: '🚀', route: '/admin/onboardings/new', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: t('admin.manageTemplates'),  icon: '📋', route: '/admin/templates',       color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: t('admin.manageUsers'),      icon: '👥', route: '/admin/users',           color: 'bg-green-50 text-green-600 border-green-100' },
    { label: t('admin.settings'),         icon: '⚙️', route: '/admin/settings',        color: 'bg-gray-50 text-gray-600 border-gray-100' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.subtitle')}</p>
        </div>

        {!loading && totalOnboardings === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-1">👋 Welkom bij Onvanta!</h2>
            <p className="text-blue-700 text-sm">Je account is actief. Begin met een template kiezen en je eerste medewerker uitnodigen.</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{stats.activeOnboardings}</p>
            <p className="text-sm text-gray-500 mt-1">{t('admin.activeOnboardings')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</p>
            <p className="text-sm text-gray-500 mt-1">{t('admin.completedThisMonth')}</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <p className="text-3xl font-bold text-red-600">{stats.atRisk}</p>
            <p className="text-sm text-red-500 mt-1">{t('admin.atRisk')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{stats.templates}</p>
            <p className="text-sm text-gray-500 mt-1">{t('admin.templatesCount')}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.route)}
              className={`bg-white rounded-2xl border p-5 text-left hover:shadow-sm transition-shadow ${action.color}`}
            >
              <span className="text-2xl mb-3 block">{action.icon}</span>
              <p className="text-sm font-medium">{action.label}</p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{t('admin.recentOnboardings')}</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700" onClick={() => router.push('/admin/onboardings')}>{t('admin.viewAll')}</button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Laden…</div>
            ) : recentOnboardings.length === 0 ? (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <p className="text-2xl mb-2">🚀</p>
                <h3 className="font-medium text-lg mb-1">Nog geen actieve onboardings</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start je eerste onboarding om nieuwe medewerkers te begeleiden.
                </p>
                <a href="/admin/onboardings/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                  Onboarding starten →
                </a>
              </div>
            ) : (
              recentOnboardings.map(onboarding => (
                <div
                  key={onboarding.id}
                  onClick={() => router.push(`/manager/${onboarding.id}`)}
                  className="p-5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${onboarding.status === 'at_risk' ? 'bg-red-100' : 'bg-blue-50'}`}>
                    <span className={`font-semibold text-sm ${onboarding.status === 'at_risk' ? 'text-red-600' : 'text-blue-600'}`}>
                      {onboarding.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{onboarding.name}</p>
                      {onboarding.status === 'at_risk' && (
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t('admin.atRisk')}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{onboarding.role}</p>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-sm font-semibold text-gray-900 mb-1">{onboarding.progress}%</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${onboarding.status === 'at_risk' ? 'bg-red-400' : 'bg-blue-500'}`}
                        style={{ width: `${onboarding.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
