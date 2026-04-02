'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const roleConfig: Record<string, { label: string; color: string }> = {
  company_admin: { label: 'Admin', color: 'bg-purple-50 text-purple-600' },
  manager:       { label: 'Manager', color: 'bg-blue-50 text-blue-600' },
  employee:      { label: 'Medewerker', color: 'bg-gray-100 text-gray-600' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' })
  const [submitting, setSubmitting] = useState(false)
  const [invited, setInvited] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  function openModal() {
    setForm({ name: '', email: '', role: 'employee' })
    setError('')
    setInvited(false)
    setShowModal(true)
  }

  async function handleInvite() {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Naam en e-mailadres zijn verplicht')
      return
    }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error || 'Er ging iets mis')
      return
    }

    setInvited(true)
    // Herlaad gebruikerslijst
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))

    setTimeout(() => {
      setShowModal(false)
      setInvited(false)
    }, 2500)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gebruikers</h1>
            <p className="text-gray-500 mt-1">
              {loading ? 'Laden...' : `${users.length} gebruiker${users.length !== 1 ? 's' : ''} in jouw organisatie.`}
            </p>
          </div>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Uitnodigen
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <p className="text-center py-12 text-gray-400 text-sm">Laden...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-sm">Geen gebruikers gevonden</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map(user => {
                const config = roleConfig[user.role] ?? roleConfig.employee
                return (
                  <div key={user.id} className="p-5 flex items-center gap-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4"
          onClick={e => { if (e.target === e.currentTarget && !submitting) setShowModal(false) }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {invited ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">📬</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Uitnodiging verstuurd!</h2>
                <p className="text-sm text-gray-500">
                  <strong>{form.email}</strong> ontvangt een uitnodigingsmail met een inloglink.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Gebruiker uitnodigen</h2>
                  <button
                    onClick={() => !submitting && setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >×</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Volledige naam</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Jan de Vries"
                      style={{ color: '#0f0f0e' }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="jan@bedrijf.nl"
                      style={{ color: '#0f0f0e' }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      style={{ color: '#0f0f0e' }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="employee">Medewerker</option>
                      <option value="manager">Manager</option>
                      <option value="company_admin">Admin</option>
                    </select>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  <button
                    onClick={handleInvite}
                    disabled={submitting || !form.name.trim() || !form.email.trim()}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Bezig...</>
                    ) : 'Uitnodiging versturen'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">
                  Er wordt een magic link gestuurd die 7 dagen geldig is.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
