'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [company, setCompany] = useState({
    name: 'Onvanta Test',
    website: 'https://onvanta.io',
    industry: 'Print-on-demand',
    size: '10-50',
  })

  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Instellingen</h1>
          <p className="text-gray-500 mt-1">Beheer je bedrijfsinstellingen en abonnement.</p>
        </div>

        {/* Bedrijfsgegevens */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Bedrijfsgegevens</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bedrijfsnaam</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany({ ...company, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
              <input
                type="text"
                value={company.website}
                onChange={e => setCompany({ ...company, website: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branche</label>
                <input
                  type="text"
                  value={company.industry}
                  onChange={e => setCompany({ ...company, industry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teamgrootte</label>
                <select
                  value={company.size}
                  onChange={e => setCompany({ ...company, size: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="1-10">1-10</option>
                  <option value="10-50">10-50</option>
                  <option value="50-100">50-100</option>
                  <option value="100+">100+</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`mt-5 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saved ? '✓ Opgeslagen!' : 'Wijzigingen opslaan'}
          </button>
        </div>

        {/* Abonnement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Abonnement</h2>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">Pro — Trial</span>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-blue-900">Trial periode</p>
              <p className="text-sm font-bold text-blue-900">8 dagen resterend</p>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '43%' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-900">Starter</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€9 <span className="text-sm font-normal text-gray-500">/seat/maand</span></p>
              <p className="text-xs text-gray-500 mt-1">Max 10 onboardees</p>
              <button className="mt-3 w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                Kiezen
              </button>
            </div>
            <div className="border-2 border-blue-500 rounded-xl p-4 relative">
              <span className="absolute -top-2 left-3 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Aanbevolen</span>
              <p className="text-sm font-semibold text-gray-900">Pro</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€15 <span className="text-sm font-normal text-gray-500">/seat/maand</span></p>
              <p className="text-xs text-gray-500 mt-1">Onbeperkt</p>
              <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                Upgraden
              </button>
            </div>
          </div>
        </div>

        {/* Gevaar zone */}
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