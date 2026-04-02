'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CompanyDetail {
  id: string; name: string; slug: string; plan: string; status: string
  createdAt: string; trialEndsAt: string | null; stripeCustomerId: string | null
}
interface User { id: string; name: string; email: string; role: string; createdAt: string }
interface Template { id: string; name: string; published: boolean; createdAt: string }
interface Onboarding {
  id: string; status: string; progressPct: number; startDate: string
  employeeName: string; employeeEmail: string; templateName: string
}
interface DetailData {
  company: CompanyDetail; users: User[]; templates: Template[]; onboardings: Onboarding[]
}

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

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
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

export default function SuperCompanyPage({ params: pp }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(pp)
  const router = useRouter()

  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'onboardings' | 'templates'>('users')

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

    // Herlaad gebruikerslijst
    const refreshed = await fetch(`/api/super/companies/${companyId}`).then(r => r.json())
    if (refreshed.users) setData(prev => prev ? { ...prev, users: refreshed.users } : prev)
    setShowUserModal(false)
    setUserForm({ name: '', email: '', role: 'employee' })
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
            <button
              className="text-sm bg-purple-900/40 text-purple-300 px-4 py-2 rounded-xl font-medium opacity-50 cursor-not-allowed border border-purple-800/40"
              title="Impersonation — nog niet geïmplementeerd"
              disabled
            >
              👤 Impersoneer
            </button>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
            {(['users', 'onboardings', 'templates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'users' ? `Gebruikers (${users.length})`
                 : tab === 'onboardings' ? `Onboardings (${onboardings.length})`
                 : `Templates (${templates.length})`}
              </button>
            ))}
          </div>
          {activeTab === 'users' && (
            <button
              onClick={() => { setShowUserModal(true); setAddUserError(''); setUserForm({ name: '', email: '', role: 'employee' }) }}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors"
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
