'use client'

export default function OnboardingPage() {
  const phases = [
    {
      title: 'Preboarding',
      description: 'Voorbereiding voor je eerste dag',
      status: 'completed',
      steps: [
        { title: 'Welkomstbericht lezen', status: 'completed' },
        { title: 'Toegang tot systemen aanvragen', status: 'completed' },
      ],
    },
    {
      title: 'Dag 1',
      description: 'Jouw eerste dag bij het bedrijf',
      status: 'active',
      steps: [
        { title: 'Welkomstvideo bekijken', status: 'completed' },
        { title: 'Kennismaking met het team', status: 'active' },
        { title: 'Bedrijfshandboek lezen', status: 'todo' },
      ],
    },
    {
      title: 'Week 1',
      description: 'De eerste week',
      status: 'todo',
      steps: [
        { title: 'Productkennis module', status: 'todo' },
        { title: 'Klantcommunicatie training', status: 'todo' },
        { title: 'Flashcards: druktechnieken', status: 'todo' },
      ],
    },
    {
      title: 'Maand 1',
      description: 'Eerste maand volledig operationeel',
      status: 'todo',
      steps: [
        { title: 'Kennistoets afleggen', status: 'todo' },
        { title: 'Eerste klantgesprek evaluatie', status: 'todo' },
      ],
    },
  ]

  const statusConfig = {
    completed: { color: 'bg-green-500', text: 'text-green-600', label: 'Afgerond', ring: 'ring-green-200' },
    active: { color: 'bg-blue-500', text: 'text-blue-600', label: 'Bezig', ring: 'ring-blue-200' },
    todo: { color: 'bg-gray-200', text: 'text-gray-400', label: 'Nog te doen', ring: 'ring-gray-100' },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">O</span>
            </div>
            <span className="font-semibold text-gray-900">Onvanta</span>
          </div>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Titel */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Jouw onboarding</h1>
          <p className="text-gray-500 mt-1">Doorloop alle fases om volledig operationeel te worden.</p>
        </div>

        {/* Voortgangsbalk */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Totale voortgang</span>
              <span className="font-semibold text-gray-900">25%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>

        {/* Fases */}
        <div className="space-y-4">
          {phases.map((phase, i) => {
            const config = statusConfig[phase.status as keyof typeof statusConfig]
            return (
              <div key={i} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden`}>
                {/* Fase header */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ring-4 ${config.ring} ${phase.status === 'completed' ? 'bg-green-50' : phase.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    {phase.status === 'completed' ? (
                      <span className="text-green-500 text-lg">✓</span>
                    ) : phase.status === 'active' ? (
                      <span className="text-blue-500 font-bold">{i + 1}</span>
                    ) : (
                      <span className="text-gray-400 font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phase.status === 'completed' ? 'bg-green-50 text-green-600' : phase.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{phase.description}</p>
                  </div>
                </div>

                {/* Stappen */}
                {(phase.status === 'active' || phase.status === 'completed') && (
                  <div className="border-t border-gray-50 px-5 pb-4">
                    <div className="space-y-2 mt-3">
                      {phase.steps.map((step, j) => (
                        <div key={j} className="flex items-center gap-3 py-2">
                          <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${step.status === 'completed' ? 'bg-green-500' : step.status === 'active' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                            {step.status === 'completed' && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className={`text-sm ${step.status === 'completed' ? 'line-through text-gray-400' : step.status === 'active' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {step.title}
                          </span>
                          {step.status === 'active' && (
                            <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Bezig</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}