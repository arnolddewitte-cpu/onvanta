'use client'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Voortgang */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Jouw onboarding</h2>
              <p className="text-sm text-gray-500 mt-0.5">Week 1 — Introductie</p>
            </div>
            <span className="text-2xl font-bold text-blue-600">0%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
        </div>

        {/* Taken vandaag */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Vandaag</h2>
          <div className="space-y-3">
            {[
              { title: 'Welkomstvideo bekijken', type: 'Video', done: false },
              { title: 'Kennismaking met het team', type: 'Meeting', done: false },
              { title: 'Bedrijfshandboek lezen', type: 'Document', done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${task.done ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{task.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flashcards */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Flashcards</h2>
            <span className="text-xs text-gray-400">Nog geen reviews</span>
          </div>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🃏</div>
            <p className="text-sm">Nog geen flashcards beschikbaar</p>
          </div>
        </div>
      </div>
    </main>
  )
}