'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface Template {
  id: string
  name: string
  description: string
  phaseCount: number
  stepCount: number
}

interface Manager {
  id: string
  name: string
  email: string
}

interface Profile {
  id: string
  role: string
  name: string
}

export default function NewOnboardingPageWrapper() {
  return (
    <Suspense>
      <NewOnboardingPage />
    </Suspense>
  )
}

function NewOnboardingPage() {
  const t = useTranslations('app')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    employeeName: searchParams.get('name') ?? '',
    employeeEmail: searchParams.get('email') ?? '',
    role: '',
    templateId: '',
    managerId: '',
    startDate: '',
  })

  const [profile, setProfile] = useState<Profile | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [loadingManagers, setLoadingManagers] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const isManager = profile?.role === 'manager'

  useEffect(() => {
    fetch('/api/me/profile')
      .then(r => r.json())
      .then((p: Profile) => {
        setProfile(p)
        if (p.role === 'manager') {
          setForm(f => ({ ...f, managerId: p.id }))
        }
      })

    fetch('/api/admin/templates')
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .finally(() => setLoadingTemplates(false))

    fetch('/api/admin/users?managers=1')
      .then(r => r.json())
      .then(data => setManagers(Array.isArray(data) ? data : []))
      .finally(() => setLoadingManagers(false))
  }, [])

  const selectedTemplate = templates.find(tmpl => tmpl.id === form.templateId)
  const selectedManager = managers.find(m => m.id === form.managerId)
  const backHref = isManager ? '/manager' : '/admin'

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/admin/onboardings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeName: form.employeeName,
        employeeEmail: form.employeeEmail,
        role: form.role,
        templateId: form.templateId,
        managerId: form.managerId || null,
        startDate: form.startDate,
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setSubmitError(data.error || t('common.error'))
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('newOnboarding.doneTitle')}</h1>
            <p className="text-gray-500 mb-2">
              {t('newOnboarding.doneText', { name: form.employeeName, email: form.employeeEmail })}
            </p>
            <p className="text-gray-400 text-sm mb-8">{t('newOnboarding.doneLinkValid')}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(backHref)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {isManager ? t('newOnboarding.backToTeamBtn') : t('newOnboarding.backToAdminBtn')}
              </button>
              <button
                onClick={() => {
                  setStep(1)
                  setForm(f => ({ employeeName: '', employeeEmail: '', role: '', templateId: '', managerId: isManager ? f.managerId : '', startDate: '' }))
                  setDone(false)
                }}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {t('newOnboarding.startAnother')}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <button
          onClick={() => router.push(backHref)}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          {isManager ? t('newOnboarding.backToTeam') : t('newOnboarding.backToAdmin')}
        </button>

        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                s < step ? 'bg-blue-600 text-white' :
                s === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {s < step ? '✓' : s}
              </div>
              <span className={`text-sm ${s === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? t('newOnboarding.step1Label') : s === 2 ? t('newOnboarding.step2Label') : t('newOnboarding.step3Label')}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('newOnboarding.step1Title')}</h1>
            <p className="text-gray-500 mb-8">{t('newOnboarding.step1Subtitle')}</p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.nameLabel')}</label>
                <input
                  type="text"
                  value={form.employeeName}
                  onChange={e => setForm({ ...form, employeeName: e.target.value })}
                  placeholder="Jan de Vries"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#0f0f0e' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.emailLabel')}</label>
                <input
                  type="email"
                  value={form.employeeEmail}
                  onChange={e => setForm({ ...form, employeeEmail: e.target.value })}
                  placeholder="jan@jouwbedrijf.nl"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#0f0f0e' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.roleLabel')}</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  placeholder={t('newOnboarding.rolePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#0f0f0e' }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!form.employeeName.trim() || !form.employeeEmail.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('newOnboarding.next')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('newOnboarding.step2Title')}</h1>
            <p className="text-gray-500 mb-8">{t('newOnboarding.step2Subtitle', { name: form.employeeName })}</p>

            {loadingTemplates ? (
              <div className="text-center py-8 text-gray-400 text-sm">{t('common.loading')}</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                {t('newOnboarding.noTemplates')}{' '}
                <a href="/admin/templates" className="text-blue-600 hover:underline">{t('newOnboarding.createTemplate')}</a>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setForm({ ...form, templateId: template.id })}
                    className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                      form.templateId === template.id
                        ? 'border-blue-500 ring-2 ring-blue-100'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{template.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        form.templateId === template.id ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                      }`}>
                        {form.templateId === template.id && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-400">
                      <span>{t('newOnboarding.phases', { count: template.phaseCount })}</span>
                      <span>{t('newOnboarding.steps', { count: template.stepCount })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                {t('newOnboarding.back')}
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.templateId}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('newOnboarding.next')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('newOnboarding.step3Title')}</h1>
            <p className="text-gray-500 mb-8">
              {isManager ? t('newOnboarding.step3SubtitleManager') : t('newOnboarding.step3SubtitleAdmin')}
            </p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              {isManager ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.managerLabel')}</label>
                  <div className="px-4 py-3 rounded-xl border border-gray-100 bg-blue-50 text-sm text-blue-700 font-medium">
                    {profile?.name} {t('newOnboarding.youSuffix')}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.managerLabel')}</label>
                  {loadingManagers ? (
                    <div className="text-sm text-gray-400 py-2">{t('common.loading')}</div>
                  ) : (
                    <select
                      value={form.managerId}
                      onChange={e => setForm({ ...form, managerId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      style={{ color: '#0f0f0e' }}
                    >
                      <option value="">{t('newOnboarding.managerOptional')}</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newOnboarding.startDateLabel')}</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: '#0f0f0e' }}
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 mt-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">{t('newOnboarding.summary')}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('newOnboarding.summaryEmployee')}</span>
                  <span className="font-medium text-gray-900">{form.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('newOnboarding.summaryEmail')}</span>
                  <span className="font-medium text-gray-900">{form.employeeEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('newOnboarding.summaryTemplate')}</span>
                  <span className="font-medium text-gray-900">{selectedTemplate?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('newOnboarding.summaryManager')}</span>
                  <span className="font-medium text-gray-900">
                    {isManager ? `${profile?.name} ${t('newOnboarding.youSuffix')}` : (selectedManager?.name ?? t('newOnboarding.noManager'))}
                  </span>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="mt-3 text-sm text-red-500">{submitError}</p>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="text-gray-500 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                {t('newOnboarding.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.startDate}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('newOnboarding.submitting')}
                  </>
                ) : t('newOnboarding.submit')}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
