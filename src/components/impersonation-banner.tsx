'use client'

import { useEffect, useState } from 'react'

interface ImpersonationStatus {
  impersonating: boolean
  name?: string
  email?: string
}

export default function ImpersonationBanner() {
  const [status, setStatus] = useState<ImpersonationStatus | null>(null)

  useEffect(() => {
    // Quick check: only call API if the non-httpOnly flag cookie is present
    if (!document.cookie.includes('impersonation-active=1')) return
    fetch('/api/me/impersonation')
      .then(r => r.json())
      .then(setStatus)
      .catch(() => {})
  }, [])

  if (!status?.impersonating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white px-4 py-2.5 flex items-center justify-between text-sm shadow-lg">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-xs bg-purple-800 px-2 py-0.5 rounded font-semibold tracking-wide">
          IMPERSONATION
        </span>
        <span>
          Je bent ingelogd als <strong>{status.name}</strong>
          <span className="text-purple-200 ml-1">({status.email})</span>
        </span>
      </div>
      <a
        href="/api/super/impersonate/end"
        className="bg-white text-purple-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
      >
        ← Terug naar super admin
      </a>
    </div>
  )
}
