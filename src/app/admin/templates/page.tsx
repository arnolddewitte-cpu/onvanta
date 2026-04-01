'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
  description: string
  published: boolean
  updatedAt: string
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
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
            <p className="text-gray-500 mt-1">Beheer de onboarding templates voor je team.</p>
          </div>
          <button
            onClick={() => router.push('/admin/templates/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nieuw template
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400 text-sm">Laden...</div>
        )}

        {error && (
          <div className="text-center py-16 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Nog geen templates. Maak je eerste template aan.
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
    </main>
  )
}
