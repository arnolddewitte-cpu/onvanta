'use client'

import { useState } from 'react'

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'done'>('all')

  const tasks = [
    { id: 1, title: 'Welkomstbericht lezen', phase: 'Preboarding', status: 'done', due: 'Gisteren' },
    { id: 2, title: 'Toegang tot systemen aanvragen', phase: 'Preboarding', status: 'done', due: 'Gisteren' },
    { id: 3, title: 'Welkomstvideo bekijken', phase: 'Dag 1', status: 'done', due: 'Vandaag' },
    { id: 4, title: 'Stel jezelf voor in het teamkanaal', phase: 'Dag 1', status: 'today', due: 'Vandaag' },
    { id: 5, title: 'Bedrijfshandboek lezen', phase: 'Dag 1', status: 'today', due: 'Vandaag' },
    { id: 6, title: 'Kennistoets module 1', phase: 'Week 1', status: 'overdue', due: '2 dagen geleden' },
    { id: 7, title: 'Productkennis module afronden', phase: 'Week 1', status: 'upcoming', due: 'Morgen' },
    { id: 8, title: 'Klantcommunicatie training', phase: 'Week 1', status: 'upcoming', due: 'Vrijdag' },
  ]

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'today') return t.status === 'today'
    if (filter === 'overdue') return t.status === 'overdue'
    if (filter === 'done') return t.status === 'done'
    return true
  })

  const statusConfig = {
    done: { label: 'Afgerond', color: 'text-green-600', bg: 'bg-green-50' },
    today: { label: 'Vandaag', color: 'text-blue-600', bg: 'bg-blue-50' },
    overdue: { label: 'Te laat', color: 'text-red-600', bg: 'bg-red-50' },
    upcoming: { label: 'Binnenkort', color: 'text-gray-500', bg: 'bg-gray-100' },
  }

  const counts = {
    all: tasks.length,
    today: tasks.filter(t => t.status === 'today').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Taken</h1>
          <p className="text-gray-500 mt-1">Overzicht van al je taken.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'all', label: 'Alles' },
            { key: 'today', label: 'Vandaag' },
            { key: 'overdue', label: 'Te laat' },
            { key: 'done', label: 'Afgerond' },
          ] as const).map(tab => (
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

        {/* Taken lijst */}
        <div className="space-y-2">
          {filtered.map(task => {
            const config = statusConfig[task.status as keyof typeof statusConfig]
            return (
              <div key={task.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'overdue' ? 'bg-red-400' :
                  task.status === 'today' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{task.phase}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{task.due}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}