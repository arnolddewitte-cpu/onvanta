'use client'

import { useRouter } from 'next/navigation'

export default function TemplatesPage() {
  const router = useRouter()

  const templates = [
    {
      id: '1',
      title: 'Customer Service Medewerker',
      description: 'Productkennis, klantcommunicatie, systemen en procedures.',
      phases: 4,
      steps: 12,
      flashcardSets: 3,
      lastUpdated: '2 dagen geleden',
      activeOnboardings: 2,
    },
    {
      id: '2',
      title: 'Sales Medewerker',
      description: 'Offertes maken, klantcontact, druktechnieken en prijsopbouw.',
      phases: 4,
      steps: 10,
      flashcardSets: 2,
      lastUpdated: '1 week geleden',
      activeOnboardings: 1,
    },
    {
      id: '3',
      title: 'Operator',
      description: 'Machines bedienen, kwaliteitscontrole en productieplanning.',
      phases: 3,
      steps: 8,
      flashcardSets: 2,
      lastUpdated: '3 dagen geleden',
      activeOnboardings: 1,
    },
  ]

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

        {/* Templates lijst */}
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{template.title}</h3>
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

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>📋 {template.phases} fases</span>
                <span>📝 {template.steps} stappen</span>
                <span>🃏 {template.flashcardSets} flashcard sets</span>
                <span>👥 {template.activeOnboardings} actief</span>
                <span className="ml-auto text-xs text-gray-400">Bijgewerkt {template.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}