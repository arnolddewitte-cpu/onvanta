'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Step {
  id: string
  title: string
  status: 'completed' | 'todo'
}

interface Phase {
  id: string
  title: string
  status: 'completed' | 'active' | 'todo'
  steps: Step[]
}

interface OnboardingData {
  instanceId: string
  progressPct: number
  totalSteps: number
  completedCount: number
  phases: Phase[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me/onboarding')
      .then(r => r.json())
      .then(d => setData(d.instance === null ? null : d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Laden...</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500 text-sm">Geen actieve onboarding gevonden.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Jouw onboarding</h1>
          <p className="text-gray-500 mt-1">Doorloop alle fases om volledig operationeel te worden.</p>
        </div>

        {/* Voortgangsbalk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Totale voortgang</span>
            <span className="font-semibold text-gray-900">{data.progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.progressPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{data.completedCount} van {data.totalSteps} stappen voltooid</p>
        </div>

        {/* Fases */}
        <div className="space-y-4">
          {data.phases.map((phase, i) => {
            const isCompleted = phase.status === 'completed'
            const isActive = phase.status === 'active'

            return (
              <div key={phase.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ${
                    isCompleted ? 'ring-green-200 bg-green-50' :
                    isActive ? 'ring-blue-200 bg-blue-50' : 'ring-gray-100 bg-gray-50'
                  }`}>
                    {isCompleted ? (
                      <span className="text-green-500 text-lg">✓</span>
                    ) : (
                      <span className={`font-bold ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isCompleted ? 'bg-green-50 text-green-600' :
                        isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? 'Afgerond' : isActive ? 'Bezig' : 'Nog te doen'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-50 px-5 pb-4">
                  <div className="space-y-1 mt-3">
                    {phase.steps.map(step => {
                      const done = step.status === 'completed'
                      const canClick = phase.status !== 'todo'

                      return (
                        <button
                          key={step.id}
                          onClick={() => canClick && router.push(`/onboarding/${step.id}`)}
                          className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-colors ${
                            !canClick ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                          disabled={!canClick}
                        >
                          <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                            done ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {done && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={`text-sm flex-1 ${
                            done ? 'line-through text-gray-400' : 'text-gray-700'
                          }`}>
                            {step.title}
                          </span>
                          {canClick && !done && <span className="text-gray-300 text-sm">→</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
