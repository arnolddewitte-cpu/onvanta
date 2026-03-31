'use client'

import { useState } from 'react'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      employee: 'Tom Janssen',
      role: 'Sales',
      step: 'Eerste klantgesprek gevoerd',
      phase: 'Week 1',
      submittedAt: '2 uur geleden',
      note: 'Ik heb gisteren mijn eerste klantgesprek gevoerd met een bestaande klant. Het ging goed, ik heb de behoeftes geïnventariseerd en een offerte toegezegd.',
    },
    {
      id: 2,
      employee: 'Mark Visser',
      role: 'Customer Service',
      step: 'Proefgesprek klantenservice',
      phase: 'Dag 1',
      submittedAt: '1 dag geleden',
      note: 'Heb een proefgesprek gedaan met een collega als klant. Ik wist de meeste vragen te beantwoorden maar had moeite met de levertijden.',
    },
  ])

  function handleApproval(id: number, approved: boolean) {
    setApprovals(prev => prev.filter(a => a.id !== id))
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Goedkeuringen</h1>
          <p className="text-gray-500 mt-1">
            {approvals.length > 0
              ? `${approvals.length} stappen wachten op jouw goedkeuring`
              : 'Geen openstaande goedkeuringen'}
          </p>
        </div>

        {approvals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 text-sm">Alles is goedgekeurd!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map(approval => (
              <div key={approval.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                {/* Medewerker info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{approval.employee.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{approval.employee}</p>
                    <p className="text-xs text-gray-500">{approval.role} · {approval.submittedAt}</p>
                  </div>
                </div>

                {/* Stap info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-400 mb-1">{approval.phase}</p>
                  <p className="text-sm font-semibold text-gray-900">{approval.step}</p>
                </div>

                {/* Notitie van medewerker */}
                <div className="mb-5">
                  <p className="text-xs text-gray-400 mb-1">Notitie medewerker</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{approval.note}</p>
                </div>

                {/* Knoppen */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproval(approval.id, false)}
                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    ✕ Afwijzen
                  </button>
                  <button
                    onClick={() => handleApproval(approval.id, true)}
                    className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    ✓ Goedkeuren
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}