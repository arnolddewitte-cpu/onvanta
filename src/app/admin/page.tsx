'use client'

import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  const stats = {
    activeOnboardings: 4,
    completedThisMonth: 2,
    atRisk: 2,
    templates: 3,
  }

  const recentOnboardings = [
    { id: '1', name: 'Tom Janssen', role: 'Sales', progress: 20, status: 'at_risk', phase: 'Dag 1' },
    { id: '2', name: 'Sarah de Vries', role: 'Customer Service', progress: 65, status: 'on_track', phase: 'Week 1' },
    { id: '3', name: 'Lisa Bakker', role: 'Operator', progress: 90, status: 'on_track', phase: 'Maand 1' },
    { id: '4', name: 'Mark Visser', role: 'Customer Service', progress: 40, status: 'at_risk', phase: 'Week 1' },
  ]

  const quickActions = [
    { label: 'Onboarding starten', icon: '🚀', route: '/admin/onboardings/new', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Templates beheren', icon: '📋', route: '/admin/templates', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Gebruikers beheren', icon: '👥', route: '/admin/users', color: 'bg-green-50 text-green-600 border-green-100' },
    { label: 'Instellingen', icon: '⚙️', route: '/admin/settings', color: 'bg-gray-50 text-gray-600 border-gray-100' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Bedrijfsdashboard</h1>
          <p className="text-gray-500 mt-1">Overzicht van alle onboardings en activiteit.</p>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{stats.activeOnboardings}</p>
            <p className="text-sm text-gray-500 mt-1">Actieve onboardings</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</p>
            <p className="text-sm text-gray-500 mt-1">Voltooid deze maand</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
            <p className="text-3xl font-bold text-red-600">{stats.atRisk}</p>
            <p className="text-sm text-red-500 mt-1">At-risk</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{stats.templates}</p>
            <p className="text-sm text-gray-500 mt-1">Templates</p>
          </div>
        </div>

        {/* Snelle acties */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.route)}
              className={`bg-white rounded-2xl border p-5 text-left hover:shadow-sm transition-shadow ${action.color}`}
            >
              <span className="text-2xl mb-3 block">{action.icon}</span>
              <p className="text-sm font-medium">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Actieve onboardings */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Actieve onboardings</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">Alles bekijken</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOnboardings.map(onboarding => (
              <div
                key={onboarding.id}
                onClick={() => router.push(`/manager/${onboarding.id}`)}
                className="p-5 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${onboarding.status === 'at_risk' ? 'bg-red-100' : 'bg-blue-50'}`}>
                  <span className={`font-semibold text-sm ${onboarding.status === 'at_risk' ? 'text-red-600' : 'text-blue-600'}`}>
                    {onboarding.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{onboarding.name}</p>
                    {onboarding.status === 'at_risk' && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">At-risk</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{onboarding.role} · {onboarding.phase}</p>
                </div>
                <div className="text-right w-32">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{onboarding.progress}%</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${onboarding.status === 'at_risk' ? 'bg-red-400' : 'bg-blue-500'}`}
                      style={{ width: `${onboarding.progress}%` }}
                    />
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