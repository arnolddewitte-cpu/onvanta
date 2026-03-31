'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TemplateEditPage() {
  const router = useRouter()

  const [template, setTemplate] = useState({
    title: 'Customer Service Medewerker',
    description: 'Productkennis, klantcommunicatie, systemen en procedures.',
    phases: [
      {
        id: '1',
        title: 'Preboarding',
        steps: [
          { id: '1', title: 'Welkomstbericht' },
          { id: '2', title: 'Toegang tot systemen aanvragen' },
        ],
      },
      {
        id: '2',
        title: 'Dag 1',
        steps: [
          { id: '3', title: 'Welkomstvideo bekijken' },
          { id: '4', title: 'Kennismaking met het team' },
        ],
      },
      {
        id: '3',
        title: 'Week 1',
        steps: [
          { id: '5', title: 'Productkennis module' },
          { id: '6', title: 'Klantcommunicatie training' },
        ],
      },
    ],
  })

  const [saved, setSaved] = useState(false)

  function addPhase() {
    const newPhase = {
      id: Date.now().toString(),
      title: 'Nieuwe fase',
      steps: [],
    }
    setTemplate({ ...template, phases: [...template.phases, newPhase] })
  }

  function updatePhaseTitle(phaseId: string, title: string) {
    setTemplate({
      ...template,
      phases: template.phases.map(p => p.id === phaseId ? { ...p, title } : p),
    })
  }

  function deletePhase(phaseId: string) {
    setTemplate({
      ...template,
      phases: template.phases.filter(p => p.id !== phaseId),
    })
  }

  function addStep(phaseId: string) {
    setTemplate({
      ...template,
      phases: template.phases.map(p =>
        p.id === phaseId
          ? { ...p, steps: [...p.steps, { id: Date.now().toString(), title: 'Nieuwe stap' }] }
          : p
      ),
    })
  }

  function updateStepTitle(phaseId: string, stepId: string, title: string) {
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
    setTemplate({
      ...template,
      phases: template.phases.map(p =>
        p.id === phaseId
          ? { ...p, steps: p.steps.filter(s => s.id !== stepId) }
          : p
      ),
    })
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
                value={template.title}
                onChange={e => setTemplate({ ...template, title: e.target.value })}
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
                <button
                  onClick={() => deletePhase(phase.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                >
                  ×
                </button>
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
          onClick={addPhase}
          className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
        >
          + Fase toevoegen
        </button>
      </div>
    </main>
  )
}