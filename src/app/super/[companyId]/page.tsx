'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyDetail {
  id: string; name: string; slug: string; plan: string; status: string
  createdAt: string; trialEndsAt: string | null; stripeCustomerId: string | null
}
interface User { id: string; name: string; email: string; role: string; createdAt: string }
interface Template { id: string; name: string; published: boolean; isGlobal: boolean; createdAt: string; phaseCount: number; stepCount: number }
interface Onboarding {
  id: string; status: string; progressPct: number; startDate: string
  employeeName: string; employeeEmail: string; templateName: string
}
interface DetailData {
  company: CompanyDetail; users: User[]; templates: Template[]; onboardings: Onboarding[]
}
interface AuditEntry {
  id: string; action: string; details: Record<string, unknown> | null
  createdAt: string; userName: string; userEmail: string
}
interface Flag { flag: string; enabled: boolean }
interface StatEntry { date: string; count: number }

const STATUS_OPTIONS = ['trial', 'active', 'paused', 'cancelled'] as const
const PLAN_OPTIONS = ['starter', 'pro', 'enterprise'] as const
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trial:     { bg: 'bg-yellow-900/40', text: 'text-yellow-400', label: 'Trial' },
  active:    { bg: 'bg-green-900/40',  text: 'text-green-400',  label: 'Actief' },
  paused:    { bg: 'bg-orange-900/40', text: 'text-orange-400', label: 'Gepauzeerd' },
  cancelled: { bg: 'bg-red-900/40',    text: 'text-red-400',    label: 'Opgezegd' },
}
const ONBOARDING_STATUS_STYLES: Record<string, string> = {
  active: 'text-green-400', at_risk: 'text-red-400',
  completed: 'text-blue-400', paused: 'text-orange-400', cancelled: 'text-gray-500',
}
const ROLE_STYLES: Record<string, string> = {
  super_admin:   'bg-purple-900/40 text-purple-300',
  company_admin: 'bg-blue-900/40 text-blue-300',
  manager:       'bg-teal-900/40 text-teal-300',
  employee:      'bg-gray-800 text-gray-400',
}
const ACTION_LABELS: Record<string, string> = {
  login:             'Ingelogd',
  onboarding_start:  'Onboarding gestart',
  step_complete:     'Stap afgerond',
  plan_change:       'Plan gewijzigd',
  impersonation_start: 'Impersonation gestart',
}
const FLAG_LABELS: Record<string, { label: string; desc: string }> = {
  ai_templates:      { label: 'AI Templates', desc: 'Template generatie via Claude AI' },
  flashcards:        { label: 'Flashcards', desc: 'Flashcard blokken in onboarding stappen' },
  manager_approval:  { label: 'Manager goedkeuring', desc: 'Stappen die managergoedkeuring vereisen' },
}

type Tab = 'users' | 'onboardings' | 'templates' | 'audit' | 'flags' | 'stats'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + ' ' +
    d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ color: '#f3f4f6' }}
        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
      />
    </div>
  )
}

// Simple bar chart with SVG
function StepChart({ data }: { data: StatEntry[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const total = data.reduce((s, d) => s + d.count, 0)
  const chartWidth = 680
  const chartHeight = 120
  const barWidth = Math.floor(chartWidth / data.length) - 2

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <p className="text-xs text-gray-500">{total} stappen afgerond (30 dagen)</p>
        <p className="text-xs text-gray-600">max: {max}/dag</p>
      </div>
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight + 24} className="block">
          {data.map((d, i) => {
            const barH = max > 0 ? Math.max(2, Math.round((d.count / max) * chartHeight)) : 2
            const x = i * (barWidth + 2)
            const y = chartHeight - barH
            const isLast = i === data.length - 1
            const isFirst = i === 0
            const showLabel = isFirst || isLast || i % 5 === 0
            return (
              <g key={d.date}>
                <rect
                  x={x} y={y} width={barWidth} height={barH}
                  fill={d.count > 0 ? '#7c3aed' : '#1f2937'}
                  rx={2}
                />
                {d.count > 0 && (
                  <text x={x + barWidth / 2} y={y - 3} textAnchor="middle" fontSize={9} fill="#9ca3af">
                    {d.count}
                  </text>
                )}
                {showLabel && (
                  <text x={x + barWidth / 2} y={chartHeight + 18} textAnchor="middle" fontSize={9} fill="#6b7280">
                    {fmtShort(d.date)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function SuperCompanyPage({ params: pp }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(pp)
  const router = useRouter()

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('users')

  // Abonnement
  const [planVal, setPlanVal] = useState('')
  const [statusVal, setStatusVal] = useState('')
  const [savingSubscription, setSavingSubscription] = useState(false)
  const [subscriptionSaved, setSubscriptionSaved] = useState(false)

  // Trial verlengen
  const [extendingTrial, setExtendingTrial] = useState(false)
  const [trialExtended, setTrialExtended] = useState(false)

  // Gebruiker toevoegen
  const [showUserModal, setShowUserModal] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'employee' })
  const [addingUser, setAddingUser] = useState(false)
  const [addUserError, setAddUserError] = useState('')

  // Impersonation
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null)

  // Audit log
  const [audit, setAudit] = useState<AuditEntry[] | null>(null)
  const [auditLoading, setAuditLoading] = useState(false)

  // Feature flags
  const [flags, setFlags] = useState<Flag[] | null>(null)
  const [flagsLoading, setFlagsLoading] = useState(false)
  const [togglingFlag, setTogglingFlag] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState<StatEntry[] | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Template isGlobal toggle
  const [togglingTemplateId, setTogglingTemplateId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/super/companies/${companyId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
        setPlanVal(d.company.plan)
        setStatusVal(d.company.status)
      })
      .finally(() => setLoading(false))
  }, [companyId])

  const loadAudit = useCallback(() => {
    if (audit !== null) return
    setAuditLoading(true)
    fetch(`/api/super/companies/${companyId}/audit`)
      .then(r => r.json())
      .then(d => setAudit(Array.isArray(d) ? d : []))
      .finally(() => setAuditLoading(false))
  }, [companyId, audit])

  const loadFlags = useCallback(() => {
    if (flags !== null) return
    setFlagsLoading(true)
    fetch(`/api/super/companies/${companyId}/flags`)
      .then(r => r.json())
      .then(d => setFlags(Array.isArray(d) ? d : []))
      .finally(() => setFlagsLoading(false))
  }, [companyId, flags])

  const loadStats = useCallback(() => {
    if (stats !== null) return
    setStatsLoading(true)
    fetch(`/api/super/companies/${companyId}/stats`)
      .then(r => r.json())
      .then(d => setStats(Array.isArray(d) ? d : []))
      .finally(() => setStatsLoading(false))
  }, [companyId, stats])

  useEffect(() => {
    if (activeTab === 'audit') loadAudit()
    if (activeTab === 'flags') loadFlags()
    if (activeTab === 'stats') loadStats()
  }, [activeTab, loadAudit, loadFlags, loadStats])

  async function handleSaveSubscription() {
    if (!data || savingSubscription) return
    setSavingSubscription(true)
    const res = await fetch(`/api/super/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planVal, status: statusVal }),
    })
    if (res.ok) {
      setData({ ...data, company: { ...data.company, plan: planVal, status: statusVal } })
      setSubscriptionSaved(true)
      setTimeout(() => setSubscriptionSaved(false), 2000)
    }
    setSavingSubscription(false)
  }

  async function handleExtendTrial() {
    if (!data || extendingTrial) return
    setExtendingTrial(true)
    const res = await fetch(`/api/super/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extendTrial: true }),
    })
    if (res.ok) {
      const { updates } = await res.json()
      setData({ ...data, company: { ...data.company, trialEndsAt: updates.trialEndsAt } })
      setTrialExtended(true)
      setTimeout(() => setTrialExtended(false), 2500)
    }
    setExtendingTrial(false)
  }

  async function handleAddUser() {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      setAddUserError('Naam en email zijn verplicht')
      return
    }
    setAddingUser(true)
    setAddUserError('')
    const res = await fetch(`/api/super/companies/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm),
    })
    const d = await res.json()
    setAddingUser(false)
    if (!res.ok) { setAddUserError(d.error || 'Er ging iets mis'); return }

    const refreshed = await fetch(`/api/super/companies/${companyId}`).then(r => r.json())
    if (refreshed.users) setData(prev => prev ? { ...prev, users: refreshed.users } : prev)
    setShowUserModal(false)
    setUserForm({ name: '', email: '', role: 'employee' })
  }

  async function handleImpersonate(userId: string) {
    setImpersonatingId(userId)
    const res = await fetch('/api/super/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const d = await res.json()
    if (res.ok && d.redirect) {
      window.location.href = d.redirect
    } else {
      setImpersonatingId(null)
    }
  }

  async function handleToggleGlobal(templateId: string, current: boolean) {
    setTogglingTemplateId(templateId)
    await fetch(`/api/super/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGlobal: !current }),
    })
    setData(prev => prev ? {
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, isGlobal: !current } : t),
    } : prev)
    setTogglingTemplateId(null)
  }

  async function handleToggleFlag(flag: string, current: boolean) {
    setTogglingFlag(flag)
    const res = await fetch(`/api/super/companies/${companyId}/flags`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag, enabled: !current }),
    })
    if (res.ok) {
      setFlags(prev => prev ? prev.map(f => f.flag === flag ? { ...f, enabled: !current } : f) : prev)
    }
    setTogglingFlag(null)
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
  const hasChanges = planVal !== company.plan || statusVal !== company.status

  const TABS: { key: Tab; label: string }[] = [
    { key: 'users',      label: `Gebruikers (${users.length})` },
    { key: 'onboardings', label: `Onboardings (${onboardings.length})` },
    { key: 'templates',  label: `Templates (${templates.length})` },
    { key: 'audit',      label: 'Audit log' },
    { key: 'flags',      label: 'Feature flags' },
    { key: 'stats',      label: 'Statistieken' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-8">

        <button onClick={() => router.push('/super')} className="text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors">
          ← Alle companies
        </button>

        {/* Header */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-5">
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
          </div>

          {/* Meta */}
          <div className="grid grid-cols-4 gap-3 mb-6">
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

          {/* Abonnement aanpassen */}
          <div className="border border-gray-800 rounded-xl p-4 mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Abonnement aanpassen</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Plan</label>
                <select
                  value={planVal}
                  onChange={e => setPlanVal(e.target.value)}
                  style={{ color: '#f3f4f6' }}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {PLAN_OPTIONS.map(p => (
                    <option key={p} value={p} style={{ background: '#1f2937' }}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                <select
                  value={statusVal}
                  onChange={e => setStatusVal(e.target.value)}
                  style={{ color: '#f3f4f6' }}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} style={{ background: '#1f2937' }}>{STATUS_STYLES[s].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveSubscription}
              disabled={!hasChanges || savingSubscription}
              className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                subscriptionSaved
                  ? 'bg-green-900/40 text-green-400'
                  : hasChanges
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {subscriptionSaved ? '✓ Opgeslagen' : savingSubscription ? 'Opslaan...' : 'Wijzigingen opslaan'}
            </button>
          </div>

          {/* Trial verlengen */}
          <div className="border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Trial verlengen</p>
                <p className="text-xs text-gray-600">
                  Huidige einddatum:{' '}
                  {company.trialEndsAt ? fmt(company.trialEndsAt) : 'Niet ingesteld'}
                </p>
              </div>
              <button
                onClick={handleExtendTrial}
                disabled={extendingTrial}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                  trialExtended
                    ? 'bg-green-900/40 text-green-400'
                    : 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 border border-yellow-800/40'
                }`}
              >
                {trialExtended ? '✓ Trial verlengd' : extendingTrial ? 'Bezig...' : '+ 14 dagen'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'users' && (
            <button
              onClick={() => { setShowUserModal(true); setAddUserError(''); setUserForm({ name: '', email: '', role: 'employee' }) }}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors whitespace-nowrap"
            >
              + Gebruiker toevoegen
            </button>
          )}
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
                    <button
                      onClick={() => handleImpersonate(user.id)}
                      disabled={impersonatingId === user.id}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-900/30 transition-colors whitespace-nowrap disabled:opacity-40"
                    >
                      {impersonatingId === user.id ? 'Bezig...' : '👤 Inloggen als'}
                    </button>
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
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-800 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${o.progressPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8">{o.progressPct}%</span>
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
                <div className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wide border-b border-gray-800">
                  <span>Template</span>
                  <span>Inhoud</span>
                  <span>Status</span>
                  <span>Aangemaakt</span>
                  <span>Globaal</span>
                </div>
                {templates.map(t => (
                  <div key={t.id} className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center">
                    <p className="text-sm font-medium text-white truncate">{t.name}</p>
                    <span className="text-xs text-gray-400">
                      {t.phaseCount} fases · {t.stepCount} stappen
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.published ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-500'}`}>
                      {t.published ? 'Gepubliceerd' : 'Concept'}
                    </span>
                    <span className="text-xs text-gray-600">{fmt(t.createdAt)}</span>
                    <button
                      onClick={() => handleToggleGlobal(t.id, t.isGlobal)}
                      disabled={togglingTemplateId === t.id}
                      title={t.isGlobal ? 'Verwijder uit bibliotheek' : 'Voeg toe aan bibliotheek'}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        t.isGlobal ? 'bg-blue-600' : 'bg-gray-700'
                      } ${togglingTemplateId === t.id ? 'opacity-50' : ''}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        t.isGlobal ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Audit log */}
        {activeTab === 'audit' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {auditLoading ? (
              <p className="text-center py-10 text-gray-600 text-sm">Laden...</p>
            ) : !audit || audit.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen audit logs</p>
            ) : (
              <div className="divide-y divide-gray-800">
                <div className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 px-5 py-2.5 text-xs font-medium text-gray-600 uppercase tracking-wide border-b border-gray-800">
                  <span>Actie</span>
                  <span>Gebruiker</span>
                  <span>Details</span>
                  <span>Tijdstip</span>
                </div>
                {audit.map(entry => (
                  <div key={entry.id} className="grid grid-cols-[1fr_1fr_2fr_auto] gap-4 px-5 py-3 items-start">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                      entry.action === 'login' ? 'bg-blue-900/40 text-blue-400' :
                      entry.action === 'step_complete' ? 'bg-green-900/40 text-green-400' :
                      entry.action === 'onboarding_start' ? 'bg-purple-900/40 text-purple-400' :
                      entry.action === 'plan_change' ? 'bg-yellow-900/40 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-300 truncate">{entry.userName}</p>
                      <p className="text-xs text-gray-600 truncate">{entry.userEmail}</p>
                    </div>
                    <p className="text-xs text-gray-600 truncate font-mono">
                      {entry.details ? JSON.stringify(entry.details).slice(0, 80) : '—'}
                    </p>
                    <span className="text-xs text-gray-600 whitespace-nowrap">{fmtTime(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Feature flags */}
        {activeTab === 'flags' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {flagsLoading ? (
              <p className="text-center py-10 text-gray-600 text-sm">Laden...</p>
            ) : !flags || flags.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen flags beschikbaar</p>
            ) : (
              <div className="divide-y divide-gray-800">
                {flags.map(f => {
                  const info = FLAG_LABELS[f.flag] ?? { label: f.flag, desc: '' }
                  return (
                    <div key={f.flag} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{info.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
                        <p className="text-xs text-gray-700 font-mono mt-0.5">{f.flag}</p>
                      </div>
                      <button
                        onClick={() => handleToggleFlag(f.flag, f.enabled)}
                        disabled={togglingFlag === f.flag}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          f.enabled ? 'bg-purple-600' : 'bg-gray-700'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          f.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className={`text-xs w-12 text-right ${f.enabled ? 'text-green-400' : 'text-gray-600'}`}>
                        {f.enabled ? 'Aan' : 'Uit'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Statistieken */}
        {activeTab === 'stats' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p className="text-sm font-medium text-white mb-4">Voltooide stappen per dag</p>
            {statsLoading ? (
              <p className="text-center py-10 text-gray-600 text-sm">Laden...</p>
            ) : !stats || stats.length === 0 ? (
              <p className="text-center py-10 text-gray-600 text-sm">Geen data beschikbaar</p>
            ) : (
              <StepChart data={stats} />
            )}
          </div>
        )}
      </div>

      {/* Modal: Gebruiker toevoegen */}
      {showUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.7)' }}
          onClick={e => { if (e.target === e.currentTarget && !addingUser) setShowUserModal(false) }}
        >
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Gebruiker toevoegen</h2>
              <button
                onClick={() => !addingUser && setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-300 text-2xl leading-none"
              >×</button>
            </div>

            <div className="space-y-4">
              <Input
                label="Volledige naam"
                value={userForm.name}
                onChange={v => setUserForm({ ...userForm, name: v })}
                placeholder="Jan de Vries"
              />
              <Input
                label="E-mailadres"
                type="email"
                value={userForm.email}
                onChange={v => setUserForm({ ...userForm, email: v })}
                placeholder="jan@bedrijf.nl"
              />
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Rol</label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ color: '#f3f4f6' }}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="employee" style={{ background: '#1f2937' }}>Medewerker (employee)</option>
                  <option value="manager" style={{ background: '#1f2937' }}>Manager</option>
                  <option value="company_admin" style={{ background: '#1f2937' }}>Beheerder (company_admin)</option>
                </select>
              </div>
            </div>

            {addUserError && (
              <p className="mt-3 text-sm text-red-400">{addUserError}</p>
            )}

            <p className="mt-3 text-xs text-gray-600">
              Er wordt een uitnodigingsmail gestuurd naar het opgegeven e-mailadres met een magic link (7 dagen geldig).
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => !addingUser && setShowUserModal(false)}
                disabled={addingUser}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddUser}
                disabled={addingUser || !userForm.name.trim() || !userForm.email.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {addingUser ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Bezig...</>
                ) : 'Toevoegen & uitnodigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
