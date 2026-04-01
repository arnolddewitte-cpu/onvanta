'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Step {
  id: string
  title: string
  blocks: string[]
}

interface Phase {
  id: string
  title: string
  description?: string
  steps: Step[]
}

interface Template {
  id: string
  name: string
  description: string
  published: boolean
  phases: Phase[]
}

const BLOCK_LABELS: Record<string, { label: string; color: string }> = {
  video:           { label: 'Video',       color: 'bg-purple-50 text-purple-600' },
  text:            { label: 'Tekst',       color: 'bg-blue-50 text-blue-600' },
  document:        { label: 'Document',    color: 'bg-yellow-50 text-yellow-600' },
  task:            { label: 'Taak',        color: 'bg-green-50 text-green-600' },
  flashcards:      { label: 'Flashcards',  color: 'bg-pink-50 text-pink-600' },
  questionnaire:   { label: 'Quiz',        color: 'bg-orange-50 text-orange-600' },
  meeting:         { label: 'Meeting',     color: 'bg-teal-50 text-teal-600' },
  acknowledgement: { label: 'Bevestiging', color: 'bg-gray-100 text-gray-600' },
  manager_approval:{ label: 'Goedkeuring', color: 'bg-red-50 text-red-600' },
}

export default function TemplateDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/templates/${params.id}`)
      .then(r => r.json())
      .then(async data => {
        if (data.error) { setError(data.error); return }

        // Haal bloktypen op per stap via de blocks API
        const allStepIds = data.phases.flatMap((p: Phase) => p.steps.map((s: Step) => s.id))
        const blocksByStep: Record<string, string[]> = {}

        await Promise.all(
          allStepIds.map(async (stepId: string) => {
            const res = await fetch(`/api/admin/steps/${stepId}/blocks`)
            const d = await res.json()
            blocksByStep[stepId] = (d.blocks ?? []).map((b: { type: string }) => b.type)
          })
        )

        setTemplate({
          id: data.id,
          name: data.name,
          description: data.description,
          published: data.published,
          phases: data.phases.map((p: Phase) => ({
            ...p,
            steps: p.steps.map((s: Step) => ({
              ...s,
              blocks: blocksByStep[s.id] ?? [],
            })),
          })),
        })
      })
      .catch(() => setError('Kon template niet laden'))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Laden...</p>
    </main>
  )

  if (error || !template) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error || 'Template niet gevonden'}</p>
    </main>
  )

  const totalSteps = template.phases.reduce((acc, p) => acc + p.steps.length, 0)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Template header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900">{template.name}</h1>
                {!template.published && (
                  <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full">
                    concept
                  </span>
                )}
              </div>
              <p className="text-gray-500 mt-1">{template.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>📋 {template.phases.length} fases</span>
                <span>📝 {totalSteps} stappen</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Bewerken
            </button>
          </div>
        </div>

        {/* Fases en stappen */}
        <div className="space-y-4">
          {template.phases.map((phase, i) => (
            <div key={phase.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{phase.title}</h3>
              </div>

              <div className="divide-y divide-gray-50">
                {phase.steps.map((step, j) => (
                  <div key={step.id} className="p-4 flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-5 flex-shrink-0">{j + 1}</span>
                    <p className="text-sm font-medium text-gray-900 flex-1">{step.title}</p>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {step.blocks.length === 0 ? (
                        <Link
                          href={`/admin/templates/${template.id}/edit/${step.id}`}
                          className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-400 border border-dashed border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-colors"
                        >
                          + blokken
                        </Link>
                      ) : (
                        step.blocks.map((blockType, bi) => {
                          const meta = BLOCK_LABELS[blockType]
                          return (
                            <Link
                              key={bi}
                              href={`/admin/templates/${template.id}/edit/${step.id}`}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-70 ${meta?.color ?? 'bg-gray-100 text-gray-500'}`}
                            >
                              {meta?.label ?? blockType}
                            </Link>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
