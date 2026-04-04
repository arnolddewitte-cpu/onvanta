'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  persisted: boolean  // false = alleen in state, nog niet in DB
}

interface Phase {
  id: string
  title: string
  steps: Step[]
}

interface Template {
  id: string
  name: string
  description: string
  phases: Phase[]
}

export default function TemplateEditPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saved, setSaved] = useState(false)
  const [savingStepId, setSavingStepId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  // Laad echte data uit Supabase
  useEffect(() => {
    fetch(`/api/admin/templates/${params.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return }
        setTemplate({
          id: data.id,
          name: data.name,
          description: data.description,
          phases: data.phases.map((p: { id: string; title: string; steps: { id: string; title: string }[] }) => ({
            id: p.id,
            title: p.title,
            steps: p.steps.map(s => ({ ...s, persisted: true })),
          })),
        })
      })
      .catch(() => setLoadError('Kon template niet laden'))
      .finally(() => setLoading(false))
  }, [params.id])

  function updatePhaseTitle(phaseId: string, title: string) {
    if (!template) return
    setTemplate({
      ...template,
      phases: template.phases.map(p => p.id === phaseId ? { ...p, title } : p),
    })
  }

  function deletePhase(phaseId: string) {
    if (!template) return
    setTemplate({ ...template, phases: template.phases.filter(p => p.id !== phaseId) })
  }

  function updateStepTitle(phaseId: string, stepId: string, title: string) {
    if (!template) return
    setTemplate({
      ...template,
      phases: template.phases.map(p =>
        p.id === phaseId
          ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, title } : s) }
          : p
      ),
    })
  }

  function deleteStep(phaseId: string, stepId: string) {
    if (!template) return
    setTemplate({
      ...template,
      phases: template.phases.map(p =>
        p.id === phaseId ? { ...p, steps: p.steps.filter(s => s.id !== stepId) } : p
      ),
    })
  }

  // Maak stap direct aan in Supabase en gebruik het echte ID terug
  async function addStep(phaseId: string) {
    if (!template) return

    const tempId = `temp-${Date.now()}`
    const phase = template.phases.find(p => p.id === phaseId)
    const order = phase ? phase.steps.length : 0

    // Voeg tijdelijke stap toe aan state zodat de UI meteen reageert
    setTemplate({
      ...template,
      phases: template.phases.map(p =>
        p.id === phaseId
          ? { ...p, steps: [...p.steps, { id: tempId, title: 'Nieuwe stap', persisted: false }] }
          : p
      ),
    })
    setSavingStepId(tempId)

    const res = await fetch(`/api/admin/phases/${phaseId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Nieuwe stap', order }),
    })
    const data = await res.json()
    setSavingStepId(null)

    if (!res.ok) {
      // Verwijder de tijdelijke stap bij fout
      setTemplate(t => t ? {
        ...t,
        phases: t.phases.map(p =>
          p.id === phaseId ? { ...p, steps: p.steps.filter(s => s.id !== tempId) } : p
        ),
      } : null)
      return
    }

    // Vervang het tijdelijke ID door het echte DB ID
    setTemplate(t => t ? {
      ...t,
      phases: t.phases.map(p =>
        p.id === phaseId
          ? { ...p, steps: p.steps.map(s => s.id === tempId ? { id: data.id, title: data.title, persisted: true } : s) }
          : p
      ),
    } : null)
  }

  async function movePhase(phaseId: string, direction: 'up' | 'down') {
    if (!template || movingId) return
    setMovingId(phaseId)

    const idx = template.phases.findIndex(p => p.id === phaseId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= template.phases.length) { setMovingId(null); return }

    // Optimistische update
    const newPhases = [...template.phases]
    ;[newPhases[idx], newPhases[swapIdx]] = [newPhases[swapIdx], newPhases[idx]]
    setTemplate({ ...template, phases: newPhases })

    await fetch(`/api/admin/phases/${phaseId}/order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })
    setMovingId(null)
  }

  async function moveStep(phaseId: string, stepId: string, direction: 'up' | 'down') {
    if (!template || movingId) return
    setMovingId(stepId)

    const phase = template.phases.find(p => p.id === phaseId)
    if (!phase) { setMovingId(null); return }
    const idx = phase.steps.findIndex(s => s.id === stepId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= phase.steps.length) { setMovingId(null); return }

    // Optimistische update
    const newSteps = [...phase.steps]
    ;[newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]]
    setTemplate({
      ...template,
      phases: template.phases.map(p => p.id === phaseId ? { ...p, steps: newSteps } : p),
    })

    await fetch(`/api/admin/steps/${stepId}/order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    })
    setMovingId(null)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Laden...</p>
      </main>
    )
  }

  if (loadError || !template) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm">{loadError || 'Template niet gevonden'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Template bewerken</h1>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saved ? '✓ Opgeslagen!' : 'Opslaan'}
          </button>
        </div>

        {/* Template info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naam template</label>
              <input
                type="text"
                value={template.name}
                onChange={e => setTemplate({ ...template, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Omschrijving</label>
              <input
                type="text"
                value={template.description}
                onChange={e => setTemplate({ ...template, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fases */}
        <div className="space-y-4 mb-4">
          {template.phases.map((phase, i) => (
            <div key={phase.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <input
                  type="text"
                  value={phase.title}
                  onChange={e => updatePhaseTitle(phase.id, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 focus:outline-none"
                />
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => movePhase(phase.id, 'up')}
                    disabled={i === 0 || movingId === phase.id}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Omhoog"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => movePhase(phase.id, 'down')}
                    disabled={i === template.phases.length - 1 || movingId === phase.id}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    title="Omlaag"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => deletePhase(phase.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors text-lg ml-1"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {phase.steps.map((step, j) => (
                  <div key={step.id} className="p-4 flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 flex-shrink-0">{j + 1}</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => updateStepTitle(phase.id, step.id, e.target.value)}
                      className="flex-1 text-sm text-gray-900 focus:outline-none border-b border-transparent focus:border-blue-300 py-1"
                    />
                    {savingStepId === step.id ? (
                      <span className="text-xs text-gray-400 px-2">Opslaan...</span>
                    ) : step.persisted ? (
                      <Link
                        href={`/admin/templates/${params.id}/edit/${step.id}`}
                        className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                      >
                        Blokken →
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-300 px-2 whitespace-nowrap">Blokken →</span>
                    )}
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => moveStep(phase.id, step.id, 'up')}
                        disabled={j === 0 || movingId === step.id}
                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                        title="Omhoog"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveStep(phase.id, step.id, 'down')}
                        disabled={j === phase.steps.length - 1 || movingId === step.id}
                        className="p-1 text-gray-300 hover:text-gray-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                        title="Omlaag"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => deleteStep(phase.id, step.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-50">
                <button
                  onClick={() => addStep(phase.id)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  + Stap toevoegen
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {}}
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          + Fase toevoegen
        </button>
      </div>
    </main>
  )
}
