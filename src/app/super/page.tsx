'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    fetch('/api/super/companies')
      .then(r => r.json())
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

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
      </div>
    </main>
  )
}
