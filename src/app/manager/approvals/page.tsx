'use client'

import { useEffect, useState } from 'react'

interface PendingApproval {
  instanceId: string
  stepId: string
  stepTitle: string
  blockTitle: string
  phaseTitle: string
  employee: { id: string; name: string; email: string }
  templateName: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/manager/approvals')
      .then(r => r.json())
      .then(data => setApprovals(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  async function handleDecision(approval: PendingApproval, approved: boolean) {
    const key = `${approval.instanceId}:${approval.stepId}`
    setProcessing(key)

    await fetch(`/api/manager/approvals/${approval.instanceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId: approval.stepId, approved }),
    })

    setApprovals(prev => prev.filter(a => !(a.instanceId === approval.instanceId && a.stepId === approval.stepId)))
    setProcessing(null)
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Laden...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Goedkeuringen</h1>
          <p className="text-gray-500 mt-1">
            {approvals.length > 0
              ? `${approvals.length} stap${approvals.length !== 1 ? 'pen' : ''} wacht${approvals.length === 1 ? '' : 'en'} op jouw goedkeuring`
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
            {approvals.map(approval => {
              const key = `${approval.instanceId}:${approval.stepId}`
              const isProcessing = processing === key

              return (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{approval.employee.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{approval.employee.name}</p>
                      <p className="text-xs text-gray-500">{approval.templateName}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-1">{approval.phaseTitle}</p>
                    <p className="text-sm font-semibold text-gray-900">{approval.stepTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{approval.blockTitle}</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecision(approval, false)}
                      disabled={isProcessing}
                      className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40"
                    >
                      ✕ Afwijzen
                    </button>
                    <button
                      onClick={() => handleDecision(approval, true)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-50 text-green-600 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : '✓ Goedkeuren'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
