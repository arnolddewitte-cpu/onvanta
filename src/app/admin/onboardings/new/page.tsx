'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    employeeName: '',
    employeeEmail: '',
    role: '',
    template: '',
    manager: '',
    startDate: '',
  })

  const templates = [
    { id: '1', title: 'Customer Service Medewerker', description: 'Productkennis, klantcommunicatie, systemen', phases: 4, steps: 12 },
    { id: '2', title: 'Sales Medewerker', description: 'Offertes, klantcontact, druktechnieken', phases: 4, steps: 10 },
    { id: '3', title: 'Operator', description: 'Machines, kwaliteitscontrole, productieplanning', phases: 3, steps: 8 },
  ]

  const managers = [
    { id: '1', name: 'Arnold de Witte' },
    { id: '2', name: 'Sarah Bakker' },
  ]

  function handleNext() {
    setStep(step + 1)
  }

  function handleBack() {
    setStep(step - 1)
  }

  function handleSubmit() {
    setStep(4)
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Stappen indicator */}
        {step < 4 && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  s < step ? 'bg-blue-600 text-white' :
                  s === step ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-sm ${s === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {s === 1 ? 'Medewerker' : s === 2 ? 'Template' : 'Details'}
                </span>
                {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        )}

        {/* Stap 1 — Medewerker gegevens */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Nieuwe medewerker</h1>
            <p className="text-gray-500 mb-8">Vul de gegevens in van de nieuwe medewerker.</p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Volledige naam</label>
                <input
                  type="text"
                  value={form.employeeName}
                  onChange={e => setForm({ ...form, employeeName: e.target.value })}
                  placeholder="Jan de Vries"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Werk e-mailadres</label>
                <input
                  type="email"
                  value={form.employeeEmail}
                  onChange={e => setForm({ ...form, employeeEmail: e.target.value })}
                  placeholder="jan@jouwbedrijf.nl"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Functie</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder="Customer Service Medewerker"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!form.employeeName || !form.employeeEmail}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* Stap 2 — Template kiezen */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Kies een template</h1>
            <p className="text-gray-500 mb-8">Welk onboarding template past bij {form.employeeName}?</p>

            <div className="space-y-3 mb-6">
              {templates.map(template => (
                <div
                  key={template.id}
                  onClick={() => setForm({ ...form, template: template.id })}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                    form.template === template.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{template.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      form.template === template.id ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {form.template === template.id && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span>{template.phases} fases</span>
                    <span>{template.steps} stappen</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={handleBack} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                ← Terug
              </button>
              <button
                onClick={handleNext}
                disabled={!form.template}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* Stap 3 — Details */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Details instellen</h1>
            <p className="text-gray-500 mb-8">Kies de manager en startdatum.</p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Manager</label>
                <select
                  value={form.manager}
                  onChange={e => setForm({ ...form, manager: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecteer een manager</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Startdatum</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Samenvatting */}
            <div className="bg-blue-50 rounded-2xl p-5 mt-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Samenvatting</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Medewerker</span>
                  <span className="font-medium text-gray-900">{form.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{form.employeeEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Template</span>
                  <span className="font-medium text-gray-900">{templates.find(t => t.id === form.template)?.title}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={handleBack} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                ← Terug
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.manager || !form.startDate}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🚀 Onboarding starten
              </button>
            </div>
          </div>
        )}

        {/* Stap 4 — Bevestiging */}
        {step === 4 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Onboarding gestart!</h1>
            <p className="text-gray-500 mb-2">
              {form.employeeName} ontvangt een uitnodigingsmail op {form.employeeEmail}.
            </p>
            <p className="text-gray-400 text-sm mb-8">De onboarding start op {form.startDate}.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Terug naar admin
              </button>
              <button
                onClick={() => { setStep(1); setForm({ employeeName: '', employeeEmail: '', role: '', template: '', manager: '', startDate: '' }) }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Nog een starten
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}