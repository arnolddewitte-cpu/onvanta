'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Phase {
  id: string
  title: string
  steps: { id: string; title: string; completed: boolean; completedAt: string | null }[]
  completedCount: number
  totalCount: number
  progressPct: number
}

interface Task {
  id: string
  title: string
  status: string
  dueDate: string | null
}

interface MemberDetail {
  instance: {
    id: string; status: string; progressPct: number; startDate: string;
    isAtRisk: boolean; lastActivity: string | null; daysSinceActivity: number | null;
  }
  employee: { id: string; name: string; email: string }
  templateName: string
  phases: Phase[]
  totalSteps: number
  completedSteps: number
  overdueTasks: number
  tasks: Task[]
}

function lastSeenLabel(daysSince: number | null, lastActivity: string | null): string {
  if (!lastActivity) return 'Nog geen activiteit'
  if (daysSince === 0) return 'Vandaag'
  if (daysSince === 1) return 'Gisteren'
  return `${daysSince} dagen geleden`
}

export default function MemberDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()

  const [data, setData] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/manager/team/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Laden...</p>
    </main>
  )

  if (error || !data) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500 text-sm">{error || 'Niet gevonden'}</p>
    </main>
  )

  const { instance, employee, templateName, phases, overdueTasks, tasks } = data
  const isAtRisk = instance.isAtRisk
  const lastSeenText = lastSeenLabel(instance.daysSinceActivity, instance.lastActivity)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Terug */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/manager')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Team overzicht
          </button>
          {instance.status === 'completed' && (
            <a
              href={`/api/manager/team/${instance.id}/certificate`}
              download
              className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-100 transition-colors border border-green-200"
            >
              <span>🎓</span>
              Certificaat downloaden
            </a>
          )}
        </div>

        {/* Profiel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAtRisk ? 'bg-red-100' : 'bg-blue-50'}`}>
              <span className={`font-bold text-lg ${isAtRisk ? 'text-red-600' : 'text-blue-600'}`}>
                {employee.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">{employee.name}</h1>
                {isAtRisk && (
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">At-risk</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Template</p>
              <p className="text-gray-900 font-medium mt-0.5 truncate">{templateName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Gestart op</p>
              <p className="text-gray-900 font-medium mt-0.5">
                {new Date(instance.startDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Laatste activiteit</p>
              <p className={`font-medium mt-0.5 ${isAtRisk ? 'text-red-500' : 'text-gray-900'}`}>{lastSeenText}</p>
            </div>
          </div>
        </div>

        {/* Voortgang totaal */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Voortgang</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Totaal — {data.completedSteps} van {data.totalSteps} stappen</span>
            <span className="font-semibold text-gray-900">{instance.progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div
              className={`h-2 rounded-full ${isAtRisk ? 'bg-red-400' : 'bg-blue-500'}`}
              style={{ width: `${instance.progressPct}%` }}
            />
          </div>
          {overdueTasks > 0 && (
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              <p className="text-xs text-red-500 mt-1">Taken te laat</p>
            </div>
          )}
        </div>

        {/* Voortgang per fase */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Voortgang per fase</h2>
          <div className="space-y-4">
            {phases.map((phase, i) => (
              <div key={phase.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-700 font-medium">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>{phase.title}
                  </span>
                  <span className="text-gray-500 text-xs">{phase.completedCount}/{phase.totalCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${phase.progressPct}%` }}
                  />
                </div>
                {/* Stappen detail */}
                <div className="mt-2 space-y-1 pl-4">
                  {phase.steps.map(step => (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                        {step.completed && <span className="text-white text-[9px]">✓</span>}
                      </div>
                      <span className={`text-xs ${step.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taken */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Taken</h2>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'overdue' ? 'bg-red-400' : 'bg-gray-200'
                  }`}>
                    {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm flex-1 ${
                    task.status === 'done' ? 'line-through text-gray-400' :
                    task.status === 'overdue' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {task.title}
                  </span>
                  {task.status === 'overdue' && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Te laat</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acties */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Acties</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`mailto:${employee.email}`}
              className="bg-gray-50 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors text-center"
            >
              ✉️ Contacteren
            </a>
            <button className="bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
              💬 Feedback geven
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
