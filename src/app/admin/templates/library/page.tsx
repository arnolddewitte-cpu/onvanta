'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LibraryTemplate {
  id: string
  name: string
  description: string
  phaseCount: number
  stepCount: number
}

export default function TemplateLibraryPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<LibraryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cloning, setCloning] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/templates/library')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setTemplates(Array.isArray(data) ? data : [])
      })
      .catch(() => setError('Kon bibliotheek niet laden'))
      .finally(() => setLoading(false))
  }, [])

  async function handleClone(templateId: string) {
    setCloning(templateId)
    const res = await fetch(`/api/admin/templates/${templateId}/clone`, { method: 'POST' })
    const data = await res.json()
    setCloning(null)

    if (!res.ok) {
      alert(data.error || 'Er ging iets mis')
      return
    }

    router.push(`/admin/templates/${data.id}/edit`)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.push('/admin/templates')}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Templates
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Bibliotheek</h1>
            <p className="text-gray-500 mt-1">Kant-en-klare templates om als startpunt te gebruiken.</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          <button
            onClick={() => router.push('/admin/templates')}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Mijn templates
          </button>
          <button
            className="px-4 py-2.5 text-sm font-medium text-blue-600 border-b-2 border-blue-600 -mb-px"
          >
            Bibliotheek
          </button>
        </div>

        {loading && <div className="text-center py-16 text-gray-400 text-sm">Laden...</div>}
        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-400 text-sm">Nog geen globale templates beschikbaar.</p>
          </div>
        )}

        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Globaal</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-400 mt-3">
                    <span>📋 {template.phaseCount} fases</span>
                    <span>📝 {template.stepCount} stappen</span>
                  </div>
                </div>
                <button
                  onClick={() => handleClone(template.id)}
                  disabled={cloning === template.id}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                >
                  {cloning === template.id ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Kopiëren...
                    </>
                  ) : (
                    'Gebruik als startpunt →'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
