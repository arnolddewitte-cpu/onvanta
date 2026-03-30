'use client'

import { useRouter } from 'next/navigation'

export default function ManagerPage() {
  const router = useRouter()

  const team = [
    {
      id: '1',
      name: 'Sarah de Vries',
      role: 'Customer Service',
      phase: 'Week 1',
      progress: 65,
      status: 'on_track',
      lastSeen: '2 uur geleden',
      overdueTasks: 0,
      flashcardAccuracy: 82,
    },
    {
      id: '2',
      name: 'Tom Janssen',
      role: 'Sales',
      phase: 'Dag 1',
      progress: 20,
      status: 'at_risk',
      lastSeen: '4 dagen geleden',
      overdueTasks: 3,
      flashcardAccuracy: 45,
    },
    {
      id: '3',
      name: 'Lisa Bakker',
      role: 'Operator',
      phase: 'Maand 1',
      progress: 90,
      status: 'on_track',
      lastSeen: 'Vandaag',
      overdueTasks: 0,
      flashcardAccuracy: 91,
    },
    {
      id: '4',
      name: 'Mark Visser',
      role: 'Customer Service',
      phase: 'Week 1',
      progress: 40,
      status: 'at_risk',
      lastSeen: '3 dagen geleden',
      overdueTasks: 2,
      flashcardAccuracy: 55,
    },
  ]

  const atRisk = team.filter(m => m.status === 'at_risk')
  const onTrack = team.filter(m => m.status === 'on_track')

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
          </div>
          <button
            onClick={() => router.push('/manager/approvals')}
            className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors font-medium"
          >
            Goedkeuringen (2)
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Team overzicht</h1>
          <p className="text-gray-500 mt-1">{team.length} medewerkers in onboarding</p>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{team.length}</p>
            <p className="text-sm text-gray-500 mt-1">In onboarding</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <p className="text-3xl font-bold text-red-600">{atRisk.length}</p>
            <p className="text-sm text-red-500 mt-1">At-risk</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <p className="text-3xl font-bold text-green-600">{onTrack.length}</p>
            <p className="text-sm text-green-500 mt-1">Op schema</p>
          </div>
        </div>

        {/* At-risk sectie */}
        {atRisk.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">⚠️ At-risk</h2>
            <div className="space-y-3">
              {atRisk.map(member => (
                <div
                  key={member.id}
                  onClick={() => router.push(`/manager/${member.id}`)}
                  className="bg-white rounded-2xl border border-red-100 p-5 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                        <span className="text-red-600 font-semibold text-sm">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role} · {member.phase}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">At-risk</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>🕐 {member.lastSeen}</span>
                    {member.overdueTasks > 0 && <span className="text-red-500">⚠️ {member.overdueTasks} taken te laat</span>}
                    <span>🃏 {member.flashcardAccuracy}% accuracy</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Voortgang</span>
                      <span className="text-gray-600 font-medium">{member.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${member.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Op schema sectie */}
        <div>
          <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">✅ Op schema</h2>
          <div className="space-y-3">
            {onTrack.map(member => (
              <div
                key={member.id}
                onClick={() => router.push(`/manager/${member.id}`)}
                className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{member.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role} · {member.phase}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">Op schema</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🕐 {member.lastSeen}</span>
                  <span>🃏 {member.flashcardAccuracy}% accuracy</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Voortgang</span>
                    <span className="text-gray-600 font-medium">{member.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${member.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}