'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type ModalMode = 'none' | 'manual' | 'ai'

interface Template {
  id: string
  name: string
  description: string
  published: boolean
  updatedAt: string
  companyId: string
  phaseCount: number
  stepCount: number
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} minuten geleden`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} uur geleden`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} dag${days !== 1 ? 'en' : ''} geleden`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks !== 1 ? 'en' : ''} geleden`
}

export default function TemplatesPage() {
  const router = useRouter()
  const nameRef = useRef<HTMLInputElement>(null)

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modal, setModal] = useState<ModalMode>('none')
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // AI generator state
  const [aiForm, setAiForm] = useState({ role: '', context: '' })
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const aiRoleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/templates')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setTemplates(data)
      })
      .catch(() => setError('Kon templates niet laden'))
      .finally(() => setLoading(false))
  }, [])

  // Focus naamveld zodra modal opent
  useEffect(() => {
    if (modal === 'manual') setTimeout(() => nameRef.current?.focus(), 50)
    if (modal === 'ai') setTimeout(() => aiRoleRef.current?.focus(), 50)
  }, [modal])

  function openModal() {
    setForm({ name: '', description: '' })
    setCreateError('')
    setModal('manual')
  }

  function openAiModal() {
    setAiForm({ role: '', context: '' })
    setAiError('')
    setModal('ai')
  }

  function closeModal() {
    if (creating || aiGenerating) return
    setModal('none')
  }

  async function handleCreate() {
    if (!form.name.trim()) { setCreateError('Naam is verplicht'); return }
    setCreating(true)
    setCreateError('')

    const companyId = templates[0]?.companyId ?? null

    const res = await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description, companyId }),
    })
    const data = await res.json()
    setCreating(false)

    if (!res.ok) {
      setCreateError(data.error || 'Er ging iets mis')
      return
    }

    router.push(`/admin/templates/${data.id}/edit`)
  }

  async function handleAiGenerate() {
    if (!aiForm.role.trim()) { setAiError('Functietitel is verplicht'); return }
    setAiGenerating(true)
    setAiError('')

    const companyId = templates[0]?.companyId ?? null

    const res = await fetch('/api/admin/templates/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: aiForm.role, context: aiForm.context, companyId }),
    })
    const data = await res.json()
    setAiGenerating(false)

    if (!res.ok) {
      setAiError(data.error || 'Er ging iets mis')
      return
    }

    router.push(`/admin/templates/${data.id}/edit`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
            <p className="text-gray-500 mt-1">Beheer de onboarding templates voor je team.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={openAiModal}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-1.5"
            >
              <span>✦</span> Genereer met AI
            </button>
            <button
              onClick={openModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Nieuw template
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Laden...</div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-4">Nog geen templates. Maak je eerste template aan.</p>
            <div className="flex justify-center gap-3">
              <button onClick={openAiModal} className="text-sm text-purple-600 font-medium hover:underline">
                ✦ Genereer met AI
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={openModal} className="text-sm text-blue-600 font-medium hover:underline">
                + Handmatig aanmaken
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                    {!template.published && (
                      <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full">
                        concept
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/admin/templates/${template.id}`)}
                    className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Bekijken
                  </button>
                  <button
                    onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                    className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Bewerken
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>📋 {template.phaseCount} fases</span>
                <span>📝 {template.stepCount} stappen</span>
                <span className="ml-auto text-xs text-gray-400">
                  Bijgewerkt {timeAgo(template.updatedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: handmatig aanmaken */}
      {modal === 'manual' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Nieuw template</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Naam <span className="text-red-400">*</span>
                </label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="bijv. Warehouse Medewerker"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Omschrijving
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Korte omschrijving van de onboarding..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {createError && (
              <p className="mt-3 text-sm text-red-500">{createError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={creating}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? 'Aanmaken...' : 'Template aanmaken →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: genereer met AI */}
      {modal === 'ai' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Template genereren met AI</h2>
              <button
                onClick={closeModal}
                disabled={aiGenerating}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-30"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Beschrijf de functie en de AI genereert automatisch een compleet onboarding programma.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Functietitel <span className="text-red-400">*</span>
                </label>
                <input
                  ref={aiRoleRef}
                  type="text"
                  value={aiForm.role}
                  onChange={e => setAiForm({ ...aiForm, role: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && !aiGenerating && handleAiGenerate()}
                  placeholder="bijv. Warehouse Medewerker, Junior Developer..."
                  disabled={aiGenerating}
                  style={{ color: '#0f0f0e' }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Extra context <span className="text-gray-400 font-normal">(optioneel)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  💡 Tip: Plak hier de volledige functieomschrijving van de medewerker. Hoe meer context je geeft (tools, verantwoordelijkheden, branche, bijzonderheden), hoe beter het gegenereerde template aansluit op de functie.
                </p>
                <textarea
                  value={aiForm.context}
                  onChange={e => setAiForm({ ...aiForm, context: e.target.value })}
                  placeholder="bijv. fysiek werk in een distributiecentrum, werkt in ploegendienst, 3-shifts..."
                  rows={3}
                  disabled={aiGenerating}
                  style={{ color: '#0f0f0e' }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            {aiGenerating && (
              <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm text-purple-700">AI is je onboarding template aan het samenstellen...</p>
                </div>
                <p className="text-xs text-purple-500 mt-1 ml-6">Dit duurt ongeveer 15-30 seconden.</p>
              </div>
            )}

            {aiError && (
              <p className="mt-3 text-sm text-red-500">{aiError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={aiGenerating}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Annuleren
              </button>
              <button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiForm.role.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Genereren...
                  </>
                ) : (
                  '✦ Template genereren'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
