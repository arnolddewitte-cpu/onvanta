'use client'

export default function MemberDetailPage() {
  const member = {
    name: 'Tom Janssen',
    role: 'Sales',
    email: 'tom@bedrijf.nl',
    phase: 'Dag 1',
    progress: 20,
    status: 'at_risk',
    lastSeen: '4 dagen geleden',
    startDate: '25 maart 2026',
    manager: 'Arnold de Witte',
    overdueTasks: 3,
    flashcardAccuracy: 45,
    quizScores: [
      { title: 'Productkennis module 1', score: 40, passed: false },
      { title: 'Klantcommunicatie basis', score: 72, passed: true },
    ],
    tasks: [
      { title: 'Welkomstvideo bekijken', status: 'done' },
      { title: 'Stel jezelf voor in teamkanaal', status: 'overdue' },
      { title: 'Bedrijfshandboek lezen', status: 'overdue' },
      { title: 'Kennistoets module 1', status: 'overdue' },
      { title: 'Productkennis module', status: 'upcoming' },
    ],
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Profiel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">{member.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">{member.name}</h1>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">At-risk</span>
              </div>
              <p className="text-sm text-gray-500">{member.role} · {member.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Gestart op</p>
              <p className="text-gray-900 font-medium mt-0.5">{member.startDate}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Huidige fase</p>
              <p className="text-gray-900 font-medium mt-0.5">{member.phase}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Laatste login</p>
              <p className="text-red-500 font-medium mt-0.5">{member.lastSeen}</p>
            </div>
          </div>
        </div>

        {/* Voortgang */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Voortgang</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Totaal</span>
            <span className="font-semibold text-gray-900">{member.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <div className="bg-red-400 h-2 rounded-full" style={{ width: `${member.progress}%` }}></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{member.overdueTasks}</p>
              <p className="text-xs text-red-500 mt-1">Taken te laat</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{member.flashcardAccuracy}%</p>
              <p className="text-xs text-orange-500 mt-1">Flashcard accuracy</p>
            </div>
          </div>
        </div>

        {/* Quizscores */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quizscores</h2>
          <div className="space-y-3">
            {member.quizScores.map((quiz, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-sm text-gray-700">{quiz.title}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {quiz.score}%
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${quiz.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {quiz.passed ? 'Geslaagd' : 'Gezakt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taken */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Taken</h2>
          <div className="space-y-2">
            {member.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'overdue' ? 'bg-red-400' : 'bg-gray-200'
                }`}>
                  {task.status === 'done' && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${
                  task.status === 'done' ? 'line-through text-gray-400' :
                  task.status === 'overdue' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {task.title}
                </span>
                {task.status === 'overdue' && (
                  <span className="ml-auto text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Te laat</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Acties */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Acties</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors">
              💬 Feedback geven
            </button>
            <button className="bg-gray-50 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              ✉️ Contacteren
            </button>
            <button className="bg-yellow-50 text-yellow-600 py-3 rounded-xl text-sm font-medium hover:bg-yellow-100 transition-colors">
              ⏸️ Onboarding pauzeren
            </button>
            <button className="bg-green-50 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors">
              📅 Deadline aanpassen
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}