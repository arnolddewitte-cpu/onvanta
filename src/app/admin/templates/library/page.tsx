'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface LibraryTemplate {
  id: string
  name: string
  description: string
  phaseCount: number
  stepCount: number
}

interface Block {
  id: string
  type: string
  title: string
  order: number
}

interface Step {
  id: string
  title: string
  order: number
  blocks: Block[]
}

interface Phase {
  id: string
  title: string
  order: number
  steps: Step[]
}

interface TemplateDetail {
  id: string
  name: string
  description: string
  phases: Phase[]
}

const BLOCK_ICONS: Record<string, string> = {
  text:             '📝',
  task:             '✅',
  flashcards:       '🃏',
  questionnaire:    '❓',
  acknowledgement:  '☑️',
  manager_approval: '👍',
  video:            '🎬',
  document:         '📄',
  meeting:          '📅',
}

export default function TemplateLibraryPage() {
  const t = useTranslations('app')
  const router = useRouter()
  const [templates, setTemplates] = useState<LibraryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cloning, setCloning] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTemplate, setDrawerTemplate] = useState<TemplateDetail | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerCloningId, setDrawerCloningId] = useState<string | null>(null)

  const blockLabels: Record<string, string> = {
    text:             t('blockTypes.text'),
    task:             t('blockTypes.task'),
    flashcards:       t('blockTypes.flashcards'),
    questionnaire:    t('blockTypes.questionnaire'),
    acknowledgement:  t('blockTypes.acknowledgement'),
    manager_approval: t('blockTypes.manager_approval'),
    video:            t('blockTypes.video'),
    document:         t('blockTypes.document'),
    meeting:          t('blockTypes.meeting'),
  }

  useEffect(() => {
    fetch('/api/admin/templates/library')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setTemplates(Array.isArray(data) ? data : [])
      })
      .catch(() => setError(t('library.couldNotLoad')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleClone(templateId: string) {
    setCloning(templateId)
    const res = await fetch(`/api/admin/templates/${templateId}/clone`, { method: 'POST' })
    const data = await res.json()
    setCloning(null)
    if (!res.ok) { alert(data.error || t('common.error')); return }
    router.push(`/admin/templates/${data.id}/edit`)
  }

  async function handleDrawerClone(templateId: string) {
    setDrawerCloningId(templateId)
    const res = await fetch(`/api/admin/templates/${templateId}/clone`, { method: 'POST' })
    const data = await res.json()
    setDrawerCloningId(null)
    if (!res.ok) { alert(data.error || t('common.error')); return }
    router.push(`/admin/templates/${data.id}/edit`)
  }

  async function openDrawer(templateId: string) {
    setDrawerOpen(true)
    setDrawerTemplate(null)
    setDrawerLoading(true)
    const res = await fetch(`/api/admin/templates/${templateId}`)
    const data = await res.json()
    setDrawerLoading(false)
    if (res.ok) setDrawerTemplate(data)
  }

  const filteredTemplates = templates.filter(tmpl => {
    const q = search.toLowerCase()
    return tmpl.name.toLowerCase().includes(q) || (tmpl.description ?? '').toLowerCase().includes(q)
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => router.push('/admin/templates')}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← {t('templates.myTemplates')}
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('library.title')}</h1>
            <p className="text-gray-500 mt-1">{t('library.subtitle')}</p>
          </div>
        </div>

        <div className="flex gap-1 mb-8 border-b border-gray-200">
          <button
            onClick={() => router.push('/admin/templates')}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t('templates.myTemplates')}
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-blue-600 border-b-2 border-blue-600 -mb-px">
            {t('library.title')}
          </button>
        </div>

        {loading && <div className="text-center py-16 text-gray-400 text-sm">{t('common.loading')}</div>}
        {error && <div className="text-center py-16 text-red-500 text-sm">{error}</div>}

        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-400 text-sm">{t('library.noTemplates')}</p>
          </div>
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="relative mb-6">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('library.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        )}

        {!loading && !error && templates.length > 0 && filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            {t('templates.noResults', { search })}
          </div>
        )}

        <div className="space-y-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-gray-400 mt-3">
                    <span>📋 {t('library.phases', { count: template.phaseCount })}</span>
                    <span>📝 {t('library.steps', { count: template.stepCount })}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openDrawer(template.id)}
                    className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    {t('library.preview')}
                  </button>
                  <button
                    onClick={() => handleClone(template.id)}
                    disabled={cloning === template.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {cloning === template.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('library.adding')}
                      </>
                    ) : t('library.addToMine')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0 pr-4">
            {drawerLoading ? (
              <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
            ) : (
              <>
                <h2 className="font-semibold text-gray-900 text-base leading-snug">
                  {drawerTemplate?.name ?? ''}
                </h2>
                {drawerTemplate?.description && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{drawerTemplate.description}</p>
                )}
              </>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {drawerLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-50 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-50 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : drawerTemplate ? (
            <div className="space-y-6">
              {drawerTemplate.phases.map((phase, phaseIdx) => (
                <div key={phase.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {phaseIdx + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm">{phase.title}</h3>
                  </div>

                  <div className="space-y-2 ml-7">
                    {phase.steps.map((step, stepIdx) => (
                      <div key={step.id} className="bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 mb-2">
                          <span className="text-gray-400 mr-1.5">{stepIdx + 1}.</span>
                          {step.title}
                        </p>
                        {step.blocks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {step.blocks.map(block => (
                              <span
                                key={block.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                                title={block.title}
                              >
                                <span>{BLOCK_ICONS[block.type] ?? '📌'}</span>
                                <span>{blockLabels[block.type] ?? block.type}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {!drawerLoading && drawerTemplate && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => handleDrawerClone(drawerTemplate.id)}
              disabled={drawerCloningId === drawerTemplate.id}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {drawerCloningId === drawerTemplate.id ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('library.adding')}
                </>
              ) : t('library.addToMine')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
