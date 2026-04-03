'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface GlobalTemplate {
  id: string
  name: string
  description: string
  isGlobal: boolean
  phaseCount: number
  stepCount: number
}

interface Company {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  createdAt: string
  trialEndsAt: string | null
  userCount: number
  onboardingCount: number
  templateCount: number
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  trial:     { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Trial' },
  active:    { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Actief' },
  paused:    { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Gepauzeerd' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Opgezegd' },
}

const PLAN_STYLES: Record<string, { bg: string; text: string }> = {
  starter:    { bg: 'bg-gray-100',   text: 'text-gray-600' },
  pro:        { bg: 'bg-blue-50',    text: 'text-blue-700' },
  enterprise: { bg: 'bg-purple-50',  text: 'text-purple-700' },
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days === 0) return 'Vandaag'
  if (days === 1) return 'Gisteren'
  if (days < 30) return `${days} dagen geleden`
  const months = Math.floor(days / 30)
  return `${months} maand${months !== 1 ? 'en' : ''} geleden`
}

export default function SuperPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [globalTemplates, setGlobalTemplates] = useState<GlobalTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [creatingTemplate, setCreatingTemplate] = useState(false)

  useEffect(() => {
    fetch('/api/super/companies')
      .then(r => r.json())
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))

    fetch('/api/super/templates')
      .then(r => r.json())
      .then(data => setGlobalTemplates(Array.isArray(data) ? data : []))
      .finally(() => setTemplatesLoading(false))
  }, [])

  async function toggleGlobal(templateId: string, current: boolean) {
    setTogglingId(templateId)
    await fetch(`/api/super/templates/${templateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGlobal: !current }),
    })
    setGlobalTemplates(prev => prev.map(t => t.id === templateId ? { ...t, isGlobal: !current } : t))
    setTogglingId(null)
  }

  async function createGlobalTemplate() {
    if (!newTemplateName.trim()) return
    setCreatingTemplate(true)
    const res = await fetch('/api/super/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTemplateName.trim() }),
    })
    const data = await res.json()
    setCreatingTemplate(false)
    if (res.ok) {
      setNewTemplateName('')
      router.push(`/admin/templates/${data.id}/edit`)
    }
  }

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  const totalUsers = companies.reduce((acc, c) => acc + c.userCount, 0)
  const trials = companies.filter(c => c.status === 'trial').length
  const paying = companies.filter(c => c.status === 'active').length

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Laden...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">SUPER ADMIN</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Platform overzicht</h1>
          <p className="text-gray-400 mt-1 text-sm">Alle companies op Onvanta</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Companies', value: companies.length, color: 'text-white' },
            { label: 'Actieve trials', value: trials, color: 'text-yellow-400' },
            { label: 'Betalend', value: paying, color: 'text-green-400' },
            { label: 'Gebruikers', value: totalUsers, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Zoekbalk */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op naam of slug..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ color: '#f3f4f6' }}
          />
        </div>

        {/* Companies tabel */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-800">
            <span>Bedrijf</span>
            <span>Plan</span>
            <span>Status</span>
            <span>Gebruikers</span>
            <span>Aangemeld</span>
            <span></span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">Geen companies gevonden</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filtered.map(company => {
                const status = STATUS_STYLES[company.status] ?? STATUS_STYLES.trial
                const plan = PLAN_STYLES[company.plan] ?? PLAN_STYLES.starter

                return (
                  <div
                    key={company.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{company.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{company.slug}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${plan.bg} ${plan.text}`}>
                      {company.plan}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-400">
                      {company.userCount}
                      <span className="text-gray-600 text-xs ml-1">({company.onboardingCount} onb.)</span>
                    </span>
                    <span className="text-sm text-gray-400">{timeAgo(company.createdAt)}</span>
                    <button
                      onClick={() => router.push(`/super/${company.id}`)}
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-900/30 transition-colors whitespace-nowrap"
                    >
                      Details →
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Globale templates */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Globale templates</h2>
              <p className="text-gray-500 text-sm mt-0.5">Zichtbaar voor alle bedrijven in de bibliotheek.</p>
            </div>
          </div>

          {/* Nieuw globaal template */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4 flex gap-3">
            <input
              type="text"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createGlobalTemplate()}
              placeholder="Naam nieuw globaal template..."
              style={{ color: '#f3f4f6' }}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
            />
            <button
              onClick={createGlobalTemplate}
              disabled={creatingTemplate || !newTemplateName.trim()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {creatingTemplate ? 'Aanmaken...' : '+ Nieuw globaal template'}
            </button>
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {templatesLoading ? (
              <div className="text-center py-10 text-gray-600 text-sm">Laden...</div>
            ) : globalTemplates.length === 0 ? (
              <div className="text-center py-10 text-gray-600 text-sm">Geen templates gevonden</div>
            ) : (
              <div className="divide-y divide-gray-800">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-800">
                  <span>Template</span>
                  <span>Inhoud</span>
                  <span>Status</span>
                  <span>Globaal</span>
                </div>
                {globalTemplates.map(t => (
                  <div key={t.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-800/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{t.name}</p>
                      {t.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</p>}
                    </div>
                    <span className="text-xs text-gray-400">
                      {t.phaseCount} fases · {t.stepCount} stappen
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                      t.isGlobal ? 'bg-blue-900/40 text-blue-300' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {t.isGlobal ? 'Globaal' : 'Privé'}
                    </span>
                    <button
                      onClick={() => toggleGlobal(t.id, t.isGlobal)}
                      disabled={togglingId === t.id}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                        t.isGlobal ? 'bg-blue-600' : 'bg-gray-700'
                      } ${togglingId === t.id ? 'opacity-50' : ''}`}
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
        </div>

      </div>
    </main>
  )
}
