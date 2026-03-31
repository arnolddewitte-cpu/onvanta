'use client'

import { useRouter } from 'next/navigation'

export default function TemplateDetailPage() {
  const router = useRouter()

  const template = {
    id: '1',
    title: 'Customer Service Medewerker',
    description: 'Productkennis, klantcommunicatie, systemen en procedures.',
    activeOnboardings: 2,
    phases: [
      {
        id: '1',
        title: 'Preboarding',
        description: 'Voorbereiding voor de eerste dag',
        steps: [
          { id: '1', title: 'Welkomstbericht', blocks: ['text', 'acknowledgement'] },
          { id: '2', title: 'Toegang tot systemen aanvragen', blocks: ['task'] },
        ],
      },
      {
        id: '2',
        title: 'Dag 1',
        description: 'De eerste dag op kantoor',
        steps: [
          { id: '3', title: 'Welkomstvideo bekijken', blocks: ['video'] },
          { id: '4', title: 'Kennismaking met het team', blocks: ['text', 'task', 'acknowledgement'] },
          { id: '5', title: 'Bedrijfshandboek lezen', blocks: ['document', 'acknowledgement'] },
        ],
      },
      {
        id: '3',
        title: 'Week 1',
        description: 'Eerste week van training',
        steps: [
          { id: '6', title: 'Productkennis module', blocks: ['video', 'text', 'flashcards', 'questionnaire'] },
          { id: '7', title: 'Klantcommunicatie training', blocks: ['video', 'text', 'task'] },
          { id: '8', title: 'Druktechnieken flashcards', blocks: ['flashcards'] },
          { id: '9', title: 'Eerste klantgesprek', blocks: ['task', 'manager_approval'] },
        ],
      },
      {
        id: '4',
        title: 'Maand 1',
        description: 'Eerste maand volledig operationeel',
        steps: [
          { id: '10', title: 'Kennistoets afleggen', blocks: ['questionnaire'] },
          { id: '11', title: 'Evaluatiegesprek', blocks: ['meeting', 'manager_approval'] },
          { id: '12', title: 'Onboarding afronden', blocks: ['acknowledgement'] },
        ],
      },
    ],
  }

  const blockLabels: Record<string, { label: string, color: string }> = {
    video: { label: 'Video', color: 'bg-purple-50 text-purple-600' },
    text: { label: 'Tekst', color: 'bg-blue-50 text-blue-600' },
    document: { label: 'Document', color: 'bg-yellow-50 text-yellow-600' },
    task: { label: 'Taak', color: 'bg-green-50 text-green-600' },
    flashcards: { label: 'Flashcards', color: 'bg-pink-50 text-pink-600' },
    questionnaire: { label: 'Quiz', color: 'bg-orange-50 text-orange-600' },
    meeting: { label: 'Meeting', color: 'bg-teal-50 text-teal-600' },
    acknowledgement: { label: 'Bevestiging', color: 'bg-gray-100 text-gray-600' },
    manager_approval: { label: 'Goedkeuring', color: 'bg-red-50 text-red-600' },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">O</span>
            </div>
            <span className="font-semibold text-gray-900">Onvanta</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Admin</span>
          </div>
          <a href="/admin/templates" className="text-sm text-gray-500 hover:text-gray-700">← Templates</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Template header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{template.title}</h1>
              <p className="text-gray-500 mt-1">{template.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>📋 {template.phases.length} fases</span>
                <span>📝 {template.phases.reduce((acc, p) => acc + p.steps.length, 0)} stappen</span>
                <span>👥 {template.activeOnboardings} actieve onboardings</span>
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
              {/* Fase header */}
              <div className="p-5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                  <p className="text-xs text-gray-500">{phase.description}</p>
                </div>
              </div>

              {/* Stappen */}
              <div className="divide-y divide-gray-50">
                {phase.steps.map((step, j) => (
                  <div key={step.id} className="p-4 flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-5">{j + 1}</span>
                    <p className="text-sm font-medium text-gray-900 flex-1">{step.title}</p>
                    <div className="flex gap-1.5">
                      {step.blocks.map(block => (
                        <span
                          key={block}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${blockLabels[block]?.color}`}
                        >
                          {blockLabels[block]?.label}
                        </span>
                      ))}
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