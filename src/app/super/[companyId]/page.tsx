'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyDetail {
  id: string; name: string; slug: string; plan: string; status: string
  createdAt: string; trialEndsAt: string | null; stripeCustomerId: string | null
}

interface User {
  id: string; name: string; email: string; role: string; createdAt: string
}

interface Template {
  id: string; name: string; published: boolean; createdAt: string
}

interface Onboarding {
  id: string; status: string; progressPct: number; startDate: string
  employeeName: string; employeeEmail: string; templateName: string
}

interface DetailData {
  company: CompanyDetail
  users: User[]
  templates: Template[]
  onboardings: Onboarding[]
}

const STATUS_OPTIONS = ['trial', 'active', 'paused', 'cancelled'] as const
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trial:     { bg: 'bg-yellow-900/40', text: 'text-yellow-400', label: 'Trial' },
  active:    { bg: 'bg-green-900/40',  text: 'text-green-400',  label: 'Actief' },
  paused:    { bg: 'bg-orange-900/40', text: 'text-orange-400', label: 'Gepauzeerd' },
  cancelled: { bg: 'bg-red-900/40',    text: 'text-red-400',    label: 'Opgezegd' },
}
const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  active:    'text-green-400',
  at_risk:   'text-red-400',
  completed: 'text-blue-400',
  paused:    'text-orange-400',
  cancelled: 'text-gray-500',
}
const ROLE_STYLES: Record<string, string> = {
  super_admin:   'bg-purple-900/40 text-purple-300',
  company_admin: 'bg-blue-900/40 text-blue-300',
  manager:       'bg-teal-900/40 text-teal-300',
  employee:      'bg-gray-800 text-gray-400',
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SuperCompanyPage({ params: pp }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(pp)
  const router = useRouter()

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'onboardings' | 'templates'>('users')

  useEffect(() => {
    fetch(`/api/super/companies/${companyId}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .finally(() => setLoading(false))
  }, [companyId])

  async function handleStatusChange(newStatus: string) {
    if (!data || updatingStatus) return
    setUpdatingStatus(true)
    const res = await fetch(`/api/super/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) setData({ ...data, company: { ...data.company, status: newStatus } })
    setUpdatingStatus(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Laden...</p>
    </main>
  )
  if (error || !data) return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-400 text-sm">{error || 'Niet gevonden'}</p>
    </main>
  )

  const { company, users, templates, onboardings } = data
  const statusStyle = STATUS_STYLES[company.status] ?? STATUS_STYLES.trial

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Terug */}
        <button
          onClick={() => router.push('/super')}
          className="text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors"
        >
          ← Alle companies
        </button>

        {/* Company header */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-white">{company.name}</h1>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                  {statusStyle.label}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {company.plan}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">{company.slug}</p>
            </div>

            {/* Impersonation knop (UI only) */}
            <button
              className="text-sm bg-purple-900/40 text-purple-300 px-4 py-2 rounded-xl font-medium opacity-50 cursor-not-allowed border border-purple-800/40"
              title="Impersonation — nog niet geïmplementeerd"
              disabled
            >
              👤 Impersoneer
            </button>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Gebruikers', value: users.length },
              { label: 'Onboardings', value: onboardings.length },
              { label: 'Templates', value: templates.length },
              { label: 'Aangemeld', value: fmt(company.createdAt) },
            ].map(item => (
              <div key={item.label} className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Status wijzigen */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Status wijzigen</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || company.status === s}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    company.status === s
                      ? `${STATUS_STYLES[s].bg} ${STATUS_STYLES[s].text} cursor-default`
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-40'
                  }`}
                >
                  {STATUS_STYLES[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          {(['users', 'onboardings', 'templates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === 'users' ? `Gebruikers (${users.length})`
               : tab === 'onboardings' ? `Onboardings (${onboardings.length})`
               : `Templates (${templates.length})`}
            </button>
          ))}
        </div>

        {/* Tab: Gebruikers */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {users.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen gebruikers</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-400 flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLES[user.role] ?? ROLE_STYLES.employee}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-600">{fmt(user.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Onboardings */}
        {activeTab === 'onboardings' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {onboardings.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen onboardings</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {onboardings.map(o => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{o.employeeName}</p>
                      <p className="text-xs text-gray-500 truncate">{o.templateName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-800 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${o.progressPct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{o.progressPct}%</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium w-20 text-right ${ONBOARDING_STATUS_STYLES[o.status] ?? 'text-gray-500'}`}>
                      {o.status}
                    </span>
                    <span className="text-xs text-gray-600">{fmt(o.startDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Templates */}
        {activeTab === 'templates' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {templates.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen templates</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.published ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-500'}`}>
                      {t.published ? 'Gepubliceerd' : 'Concept'}
                    </span>
                    <span className="text-xs text-gray-600">{fmt(t.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}
