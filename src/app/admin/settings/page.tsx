'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Tab = 'algemeen' | 'huisstijl' | 'abonnement'

interface Company {
  id: string
  name: string
  plan: string
  status: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
  logoUrl: string | null
  senderName: string | null
  welcomeMessage: string | null
  brandColor: string | null
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  const tabParam = (searchParams.get('tab') as Tab) ?? 'algemeen'

  const [activeTab, setActiveTab] = useState<Tab>(tabParam)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  // Algemeen
  const [companyName, setCompanyName] = useState('')
  const [savedGeneral, setSavedGeneral] = useState(false)

  // Huisstijl
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [senderName, setSenderName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [brandColor, setBrandColor] = useState('#2563eb')
  const [savedBranding, setSavedBranding] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Abonnement
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
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
          setLogoUrl(data.logoUrl ?? null)
          setSenderName(data.senderName ?? '')
          setWelcomeMessage(data.welcomeMessage ?? '')
          setBrandColor(data.brandColor ?? '#2563eb')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveGeneral() {
    if (!company) return
    await fetch('/api/admin/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName }),
    })
    setCompany({ ...company, name: companyName })
    setSavedGeneral(true)
    setTimeout(() => setSavedGeneral(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError('')
    setLogoUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/company/logo', { method: 'POST', body: form })
    const data = await res.json()
    setLogoUploading(false)
    if (!res.ok) {
      setLogoError(data.error ?? 'Upload mislukt')
      return
    }
    setLogoUrl(data.logoUrl)
    if (company) setCompany({ ...company, logoUrl: data.logoUrl })
  }

  async function handleSaveBranding() {
    if (!company) return
    await fetch('/api/admin/company', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, welcomeMessage, brandColor }),
    })
    setCompany({ ...company, senderName, welcomeMessage, brandColor })
    setSavedBranding(true)
    setTimeout(() => setSavedBranding(false), 2000)
  }

  async function handleCheckout() {
    setCheckingOut(true)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
        setCheckingOut(false)
      }
    } catch {
      setCheckoutError('Kan geen verbinding maken. Controleer je internetverbinding.')
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

  const TABS: { id: Tab; label: string }[] = [
    { id: 'algemeen', label: 'Algemeen' },
    { id: 'huisstijl', label: 'Huisstijl' },
    { id: 'abonnement', label: 'Abonnement' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Instellingen</h1>
          <p className="text-gray-500 mt-1">Beheer je bedrijfsinstellingen en abonnement.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-green-600 text-lg">✓</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Betaling geslaagd!</p>
              <p className="text-sm text-green-700">Je abonnement is geactiveerd. Bedankt!</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Algemeen ── */}
        {activeTab === 'algemeen' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
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
                  onClick={handleSaveGeneral}
                  className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    savedGeneral ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {savedGeneral ? '✓ Opgeslagen!' : 'Wijzigingen opslaan'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Huisstijl ── */}
        {activeTab === 'huisstijl' && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-1">Bedrijfslogo</h2>
              <p className="text-xs text-gray-500 mb-5">Wordt bovenaan uitnodigingsmails getoond. Max 2 MB, JPG/PNG/WebP/SVG.</p>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="w-24 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center">
                    Geen logo
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={logoUploading}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {logoUploading ? 'Uploaden...' : logoUrl ? 'Logo wijzigen' : 'Logo uploaden'}
                  </button>
                  {logoUrl && (
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/company', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ logoUrl: null }),
                        })
                        setLogoUrl(null)
                        if (company) setCompany({ ...company, logoUrl: null })
                      }}
                      className="ml-2 px-3 py-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      Verwijderen
                    </button>
                  )}
                  {logoError && <p className="mt-1.5 text-xs text-red-500">{logoError}</p>}
                </div>
              </div>
            </div>

            {/* Stijl & tekst */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">E-mail huisstijl</h2>
              {loading ? (
                <div className="space-y-4">
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Afzendernaam
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder={`Team ${company?.name ?? 'Jouw bedrijf'}`}
                      maxLength={80}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-400">Verschijnt als afzender in de inbox. Bijv. &ldquo;Team Acme B.V.&rdquo;</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Welkomsttekst
                    </label>
                    <textarea
                      value={welcomeMessage}
                      onChange={e => setWelcomeMessage(e.target.value)}
                      placeholder="Welkom bij ons team! We kijken ernaar uit om je te verwelkomen..."
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">{welcomeMessage.length}/500 tekens · Persoonlijk bericht van de directeur of HR</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Primaire kleur
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="relative w-10 h-10 rounded-xl border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0"
                        onClick={() => document.getElementById('brand-color-input')?.click()}
                      >
                        <div className="w-full h-full" style={{ background: brandColor }} />
                        <input
                          id="brand-color-input"
                          type="color"
                          value={brandColor}
                          onChange={e => setBrandColor(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={brandColor}
                        onChange={e => {
                          const v = e.target.value
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBrandColor(v)
                        }}
                        maxLength={7}
                        className="w-28 px-3 py-2 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-400">Wordt gebruikt voor de knop in uitnodigingsmails</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-500">Voorvertoning e-mail header</p>
                    </div>
                    <div className="p-4">
                      <div className="rounded-xl overflow-hidden border border-gray-200 max-w-sm">
                        <div className="px-5 py-4 flex items-center gap-3" style={{ background: brandColor }}>
                          {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="Logo" className="h-8 max-w-[140px] object-contain" />
                          ) : (
                            <span className="text-white font-semibold text-base">
                              {senderName || company?.name || 'Jouw bedrijf'}
                            </span>
                          )}
                        </div>
                        <div className="px-5 py-4 bg-white">
                          <p className="text-sm text-gray-500 mb-3">Hallo Jan,</p>
                          {welcomeMessage && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg" style={{ borderLeft: `3px solid ${brandColor}` }}>
                              <p className="text-xs text-gray-600 italic leading-relaxed">{welcomeMessage.slice(0, 80)}{welcomeMessage.length > 80 ? '...' : ''}</p>
                            </div>
                          )}
                          <div className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: brandColor }}>
                            Start je onboarding →
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBranding}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      savedBranding ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {savedBranding ? '✓ Opgeslagen!' : 'Huisstijl opslaan'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Abonnement ── */}
        {activeTab === 'abonnement' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Abonnement</h2>
              {company && (
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium capitalize">
                  {company.status === 'trial' ? 'Trial' : company.status === 'active' ? 'Actief' : company.status}
                </span>
              )}
            </div>

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
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Managers en admins altijd gratis</li>
                <li className="flex items-center gap-2"><span className="text-green-600">✓</span> 14 dagen gratis proberen</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {([[3, '€74,97'], [5, '€124,95'], [10, '€249,90']] as [number, string][]).map(([n, price]) => (
                  <div key={n} className="flex justify-between text-xs">
                    <span className="text-gray-500">{n} actieve onboardees</span>
                    <span className="font-medium text-gray-700">{price}/maand</span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-0.5">Excl. BTW</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-500 leading-relaxed">
              <p className="font-medium text-gray-700 mb-1">Hoe werkt de facturering?</p>
              <p>Je betaalt achteraf op basis van het aantal actieve onboardees. Aan het einde van elke maand tellen we automatisch hoeveel medewerkers actief bezig zijn met hun onboarding — en Stripe stuurt de factuur. Geen actieve onboardees = geen kosten.</p>
            </div>

            {isActive && company?.stripeCustomerId ? (
              <button
                onClick={handlePortal}
                disabled={openingPortal}
                className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                {openingPortal ? 'Laden...' : 'Beheer abonnement →'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {checkingOut ? 'Laden...' : isTrial ? 'Activeer abonnement' : 'Start free trial'}
                </button>
                {checkoutError && (
                  <p className="mt-2 text-xs text-red-600 text-center">{checkoutError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Gevarenzone — altijd zichtbaar */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 mt-6">
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
