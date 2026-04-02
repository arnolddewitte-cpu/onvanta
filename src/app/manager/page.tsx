'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TeamMember {
  instanceId: string
  employee: { id: string; name: string; email: string }
  templateName: string
  progressPct: number
  startDate: string
  lastActivity: string | null
  daysSinceActivity: number
  overdueTasks: number
  isAtRisk: boolean
}

function timeAgo(days: number, lastActivity: string | null): string {
  if (!lastActivity) return 'Nog geen activiteit'
  if (days === 0) return 'Vandaag'
  if (days === 1) return 'Gisteren'
  return `${days} dagen geleden`
}

export default function ManagerPage() {
  const router = useRouter()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manager/team')
      .then(r => r.json())
      .then(data => setTeam(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const atRisk = team.filter(m => m.isAtRisk)
  const onTrack = team.filter(m => !m.isAtRisk)

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Laden...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Team overzicht</h1>
            <p className="text-gray-500 mt-1">{team.length} medewerker{team.length !== 1 ? 's' : ''} in onboarding</p>
          </div>
          <button
            onClick={() => router.push('/admin/onboardings/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            + Onboarding starten
          </button>
        </div>

        {team.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500 text-sm mb-4">Nog geen medewerkers in onboarding.</p>
            <button
              onClick={() => router.push('/admin/onboardings/new')}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Eerste onboarding starten
            </button>
          </div>
        ) : (
          <>
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

            {/* At-risk */}
            {atRisk.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">⚠️ At-risk</h2>
                <div className="space-y-3">
                  {atRisk.map(member => (
                    <MemberCard
                      key={member.instanceId}
                      member={member}
                      onClick={() => router.push(`/manager/${member.instanceId}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Op schema */}
            {onTrack.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">✅ Op schema</h2>
                <div className="space-y-3">
                  {onTrack.map(member => (
                    <MemberCard
                      key={member.instanceId}
                      member={member}
                      onClick={() => router.push(`/manager/${member.instanceId}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function MemberCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  const barColor = member.isAtRisk ? 'bg-red-400' : 'bg-green-500'
  const lastSeenText = timeAgo(member.daysSinceActivity, member.lastActivity)

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-sm transition-shadow ${member.isAtRisk ? 'border-red-100' : 'border-gray-100'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${member.isAtRisk ? 'bg-red-100' : 'bg-blue-50'}`}>
            <span className={`font-semibold text-sm ${member.isAtRisk ? 'text-red-600' : 'text-blue-600'}`}>
              {member.employee.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{member.employee.name}</p>
            <p className="text-xs text-gray-500">{member.templateName}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.isAtRisk ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {member.isAtRisk ? 'At-risk' : 'Op schema'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span>🕐 {lastSeenText}</span>
        {member.overdueTasks > 0 && (
          <span className="text-red-500">⚠️ {member.overdueTasks} te laat</span>
        )}
      </div>

      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Voortgang</span>
        <span className="text-gray-600 font-medium">{member.progressPct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${member.progressPct}%` }} />
      </div>
    </div>
  )
}
