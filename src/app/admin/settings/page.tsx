'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Company {
  id: string
  name: string
  plan: string
  status: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [saved, setSaved] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(successParam === 'true')

  useEffect(() => {
    if (showSuccess) {
      router.replace('/admin/settings')
      const t = setTimeout(() => setShowSuccess(false), 6000)
      return () => clearTimeout(t)
    }
  }, [showSuccess, router])

  useEffect(() => {
    fetch('/api/admin/company')
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setCompany(data)
          setCompanyName(data.name)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!company) return
    await fetch('/api/admin/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName }),
    })
    setCompany({ ...company, name: companyName })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleCheckout() {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout error:', data.error)
        setCheckingOut(false)
      }
    } catch (err) {
      console.error('Checkout fetch error:', err)
      setCheckingOut(false)
    }
  }

  async function handlePortal() {
    setOpeningPortal(true)
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setOpeningPortal(false)
    }
  }

  const trialDaysLeft = company?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(company.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null

  const trialPct = trialDaysLeft !== null
    ? Math.round(((14 - trialDaysLeft) / 14) * 100)
    : 0

  const isActive = company?.status === 'active'
  const isTrial = company?.status === 'trial'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Instellingen</h1>
          <p className="text-gray-500 mt-1">Beheer je bedrijfsinstellingen en abonnement.</p>
        </div>

        {/* Succesmelding */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-green-600 text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Betaling geslaagd!</p>
              <p className="text-sm text-green-700">Je abonnement is geactiveerd. Bedankt!</p>
            </div>
          </div>
        )}

        {/* Bedrijfsgegevens */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Bedrijfsgegevens</h2>
          {loading ? (
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrijfsnaam</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saved ? '✓ Opgeslagen!' : 'Wijzigingen opslaan'}
              </button>
            </>
          )}
        </div>

        {/* Abonnement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Abonnement</h2>
            {company && (
              <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium capitalize">
                {company.status === 'trial' ? 'Trial' : company.status === 'active' ? 'Actief' : company.status}
              </span>
            )}
          </div>

          {/* Trial balk */}
          {isTrial && trialDaysLeft !== null && (
            <div className="bg-blue-50 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-blue-900">Trial periode</p>
                <p className="text-sm font-bold text-blue-900">{trialDaysLeft} dagen resterend</p>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${trialPct}%` }} />
              </div>
            </div>
          )}

          {/* Pricing card */}
          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Per actieve onboardee</p>
                <p className="text-xs text-gray-500 mt-0.5">Managers en admins altijd gratis</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">€24,99</span>
                <span className="text-xs text-gray-500 ml-1">/maand</span>
              </div>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Alle features inbegrepen</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Betaal alleen voor actieve onboardees</li>
              <li className="flex items-center gap-2"><span className="text-green-600">✓</span> 14 dagen gratis proberen</li>
            </ul>
          </div>

          {/* Actief abonnement: portal knop */}
          {isActive && company?.stripeCustomerId ? (
            <button
              onClick={handlePortal}
              disabled={openingPortal}
              className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {openingPortal ? 'Laden...' : 'Beheer abonnement →'}
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {checkingOut ? 'Laden...' : isTrial ? 'Activeer abonnement' : 'Start free trial'}
            </button>
          )}
        </div>

        {/* Gevarenzone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="font-semibold text-red-600 mb-4">Gevarenzone</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Account pauzeren</p>
                <p className="text-xs text-gray-500">Alle onboardings worden tijdelijk gestopt.</p>
              </div>
              <button className="text-sm bg-yellow-50 text-yellow-600 px-4 py-2 rounded-xl hover:bg-yellow-100 transition-colors font-medium">
                Pauzeren
              </button>
            </div>
            <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Account verwijderen</p>
                <p className="text-xs text-gray-500">Alle data wordt permanent verwijderd.</p>
              </div>
              <button className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-medium">
                Verwijderen
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}
