'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface TodayTask {
  stepId: string
  title: string
  phaseTitle: string
  blockTypes: string[]
  done: boolean
}

interface FlashcardStep {
  stepId: string
  title: string
  cardCount: number
}

interface DashboardData {
  user: { name: string; email: string }
  instance: {
    id: string
    status: string
    progressPct: number
    startDate: string
    templateName: string
    managerName: string | null
    currentPhaseTitle: string
    totalSteps: number
    completedCount: number
  } | null
  todayTasks: TodayTask[]
  flashcardSteps: FlashcardStep[]
}

export default function DashboardPage() {
  const t = useTranslations('app')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('common.loading')}</p>
      </main>
    )
  }

  if (!data?.instance) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="font-semibold text-gray-900 mb-2">{t('dashboard.noOnboardingTitle')}</h2>
            <p className="text-gray-500 text-sm">{t('dashboard.noOnboardingText')}</p>
          </div>
        </div>
      </main>
    )
  }

  const { instance, todayTasks, flashcardSteps } = data

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{instance.templateName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{instance.currentPhaseTitle}</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">{instance.progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${instance.progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{t('dashboard.stepsCompleted', { completed: instance.completedCount, total: instance.totalSteps })}</span>
            {instance.managerName && <span>{t('dashboard.supervisor')}: {instance.managerName}</span>}
          </div>
        </div>

        {/* Continue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard.continueTitle')}</h2>
            <Link href="/onboarding" className="text-xs text-blue-600 hover:underline">
              {t('dashboard.allSteps')}
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm text-gray-500">{t('dashboard.allDone')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => (
                <Link
                  key={task.stepId}
                  href={`/onboarding/${task.stepId}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-blue-100 transition-colors group"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 group-hover:border-blue-400 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{task.phaseTitle}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {task.blockTypes.slice(0, 2).map((type, i) => (
                      <span key={i} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {t(`blockTypes.${type}` as Parameters<typeof t>[0]) || type}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Flashcards */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{t('dashboard.flashcardsTitle')}</h2>
          </div>

          {flashcardSteps.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">🃏</div>
              <p className="text-sm">{t('dashboard.noFlashcards')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {flashcardSteps.map(fc => (
                <Link
                  key={fc.stepId}
                  href={`/onboarding/${fc.stepId}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🃏</span>
                    <p className="text-sm font-medium text-gray-900">{fc.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">{t('dashboard.cards', { count: fc.cardCount })}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
