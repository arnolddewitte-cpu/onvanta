'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface Task {
  id: string
  title: string
  status: 'done' | 'overdue' | 'today' | 'upcoming'
  dueLabel: string
}

export default function TasksPage() {
  const t = useTranslations('app')
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'done'>('all')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [noInstance, setNoInstance] = useState(false)

  useEffect(() => {
    fetch('/api/me/tasks')
      .then(r => r.json())
      .then(d => {
        if (d.instance === null) setNoInstance(true)
        setTasks(Array.isArray(d.tasks) ? d.tasks : [])
      })
      .finally(() => setLoading(false))
  }, [])

  const statusConfig = {
    done:     { label: t('tasks.statusDone'),     color: 'text-green-600', bg: 'bg-green-50' },
    today:    { label: t('tasks.statusToday'),    color: 'text-blue-600',  bg: 'bg-blue-50' },
    overdue:  { label: t('tasks.statusOverdue'),  color: 'text-red-600',   bg: 'bg-red-50' },
    upcoming: { label: t('tasks.statusUpcoming'), color: 'text-gray-500',  bg: 'bg-gray-100' },
  }

  const tabs = [
    { key: 'all' as const,     label: t('tasks.filterAll') },
    { key: 'today' as const,   label: t('tasks.filterToday') },
    { key: 'overdue' as const, label: t('tasks.filterOverdue') },
    { key: 'done' as const,    label: t('tasks.filterDone') },
  ]

  const filtered = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const counts = {
    all:     tasks.length,
    today:   tasks.filter(t => t.status === 'today').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    done:    tasks.filter(t => t.status === 'done').length,
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{t('tasks.title')}</h1>
          <p className="text-gray-500 mt-1">{t('tasks.subtitle')}</p>
        </div>

        {noInstance ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500 text-sm">{t('tasks.noOnboarding')}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-500 text-sm">{t('tasks.noTasks')}</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    filter === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-sm">{t('tasks.noTasksInFilter')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(task => {
                  const config = statusConfig[task.status]
                  return (
                    <div key={task.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                        task.status === 'done'    ? 'bg-green-500' :
                        task.status === 'overdue' ? 'bg-red-400' :
                        task.status === 'today'   ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        {task.dueLabel && (
                          <p className="text-xs text-gray-400 mt-1">{task.dueLabel}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
