'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('employee')
  const [invited, setInvited] = useState(false)

  const users = [
    { id: '1', name: 'Arnold de Witte', email: 'hoi@arnolddewitte.nl', role: 'company_admin', lastSeen: 'Vandaag', status: 'active' },
    { id: '2', name: 'Sarah de Vries', email: 'sarah@bedrijf.nl', role: 'employee', lastSeen: '2 uur geleden', status: 'active' },
    { id: '3', name: 'Tom Janssen', email: 'tom@bedrijf.nl', role: 'employee', lastSeen: '4 dagen geleden', status: 'active' },
    { id: '4', name: 'Lisa Bakker', email: 'lisa@bedrijf.nl', role: 'manager', lastSeen: 'Gisteren', status: 'active' },
    { id: '5', name: 'Mark Visser', email: 'mark@bedrijf.nl', role: 'employee', lastSeen: '3 dagen geleden', status: 'active' },
    { id: '6', name: 'Petra Smit', email: 'petra@bedrijf.nl', role: 'employee', lastSeen: 'Nooit', status: 'invited' },
  ]

  const roleConfig = {
    company_admin: { label: 'Admin', color: 'bg-purple-50 text-purple-600' },
    manager: { label: 'Manager', color: 'bg-blue-50 text-blue-600' },
    employee: { label: 'Medewerker', color: 'bg-gray-100 text-gray-600' },
  }

  function handleInvite() {
    setInvited(true)
    setTimeout(() => {
      setInvited(false)
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('employee')
    }, 2000)
  }

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
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Admin</span>
          </div>
          <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Admin</a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gebruikers</h1>
            <p className="text-gray-500 mt-1">{users.length} gebruikers in jouw organisatie.</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Uitnodigen
          </button>
        </div>

        {/* Gebruikers lijst */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {users.map(user => {
              const config = roleConfig[user.role as keyof typeof roleConfig]
              return (
                <div key={user.id} className="p-5 flex items-center gap-4">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">{user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      {user.status === 'invited' && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">Uitgenodigd</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  <p className="text-xs text-gray-400 w-28 text-right">
                    {user.status === 'invited' ? 'Nog niet ingelogd' : `Laatst gezien: ${user.lastSeen}`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {invited ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">📬</div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Uitnodiging verstuurd!</h2>
                <p className="text-sm text-gray-500">{inviteEmail} ontvangt een uitnodigingsmail.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Gebruiker uitnodigen</h2>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="naam@bedrijf.nl"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="employee">Medewerker</option>
                      <option value="manager">Manager</option>
                      <option value="company_admin">Admin</option>
                    </select>
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Uitnodiging versturen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}