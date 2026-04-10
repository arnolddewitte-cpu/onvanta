'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getEmbedUrl } from '@/lib/video'

interface Block {
  id: string
  type: string
  title: string
  order: number
  config: Record<string, unknown>
}

interface StepData {
  step: {
    id: string
    title: string
    description: string | null
    phaseTitle: string
  }
  blocks: Block[]
  completed: boolean
  instanceId: string | null
  nextStepId: string | null
}

export default function StepPage({ params: paramsPromise }: { params: Promise<{ stepid: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()

  const [data, setData] = useState<StepData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [checkedBlocks, setCheckedBlocks] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Per-block reset keys for flashcards/quiz (incrementing forces remount)
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch(`/api/me/onboarding/${params.stepid}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
        if (d.completed) {
          setCheckedBlocks(new Set(d.blocks.map((b: Block) => b.id)))
        }
      })
      .finally(() => setLoading(false))
  }, [params.stepid])

  const requiredBlocks = (data?.blocks ?? []).filter(b =>
    b.type === 'acknowledgement' || b.type === 'task'
  )
  const allRequiredChecked = requiredBlocks.length === 0 || requiredBlocks.every(b => checkedBlocks.has(b.id))

  async function handleComplete() {
    if (!data || saving) return
    setSaving(true)
    setSaveError('')

    const res = await fetch(`/api/me/onboarding/${params.stepid}`, { method: 'POST' })
    const result = await res.json()

    setSaving(false)

    if (!res.ok) {
      setSaveError(result.error ?? 'Opslaan mislukt. Probeer het opnieuw.')
      return
    }

    if (data.nextStepId) {
      router.push(`/onboarding/${data.nextStepId}`)
    } else {
      router.push('/onboarding')
    }
  }

  function toggleBlock(blockId: string) {
    setCheckedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      return next
    })
  }

  function resetBlock(blockId: string) {
    setResetKeys(prev => ({ ...prev, [blockId]: (prev[blockId] ?? 0) + 1 }))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Laden...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm">{error || 'Stap niet gevonden'}</p>
      </main>
    )
  }

  const { step, blocks } = data

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Stap header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => router.push('/onboarding')}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Terug
            </button>
            <span className="text-gray-200">·</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{step.phaseTitle}</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{step.title}</h1>
          {step.description && <p className="text-gray-500 mt-1">{step.description}</p>}
        </div>

        {/* Oefenmodus banner */}
        {data.completed && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <span className="text-amber-500 text-lg flex-shrink-0">✓</span>
            <p className="text-sm text-amber-800">
              Je hebt deze stap al voltooid — je kunt hem opnieuw bekijken en oefenen.
            </p>
          </div>
        )}

        {/* Blokken */}
        <div className="space-y-4">
          {blocks.map(block => (
            <div key={block.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Video */}
              {block.type === 'video' && (() => {
                const rawUrl = block.config.url as string | undefined
                const embedUrl = rawUrl ? getEmbedUrl(rawUrl) : null
                return (
                  <div>
                    {embedUrl ? (
                      <div className="aspect-video bg-gray-900">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : rawUrl ? (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <a href={rawUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline">
                          Video openen →
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">Video nog niet toegevoegd</p>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-900">{block.title}</p>
                    </div>
                  </div>
                )
              })()}

              {/* Tekst */}
              {block.type === 'text' && (
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">{block.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {(block.config.body as string) || ''}
                  </p>
                </div>
              )}

              {/* Taak */}
              {block.type === 'task' && (
                <div className="p-5 flex items-start gap-4">
                  <button
                    onClick={() => !data.completed && toggleBlock(block.id)}
                    className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      checkedBlocks.has(block.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 hover:border-blue-500'
                    } ${data.completed ? 'cursor-default' : ''}`}
                  >
                    {checkedBlocks.has(block.id) && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{block.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{(block.config.description as string) || ''}</p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full flex-shrink-0">Taak</span>
                </div>
              )}

              {/* Acknowledgement */}
              {block.type === 'acknowledgement' && (
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => !data.completed && toggleBlock(block.id)}
                      className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        checkedBlocks.has(block.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-500'
                      } ${data.completed ? 'cursor-default' : ''}`}
                    >
                      {checkedBlocks.has(block.id) && <span className="text-white text-xs">✓</span>}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{block.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{(block.config.statement as string) || ''}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flashcards */}
              {block.type === 'flashcards' && (
                <div>
                  <FlashcardBlock
                    key={resetKeys[block.id] ?? 0}
                    title={block.title}
                    cards={(block.config.cards as { question: string; answer: string }[]) ?? []}
                  />
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => resetBlock(block.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ↺ Opnieuw oefenen
                    </button>
                  </div>
                </div>
              )}

              {/* Questionnaire */}
              {block.type === 'questionnaire' && (
                <div>
                  <QuizBlock
                    key={resetKeys[block.id] ?? 0}
                    title={block.title}
                    questions={(block.config.questions as { question: string; options: string[]; correct: number }[]) ?? []}
                  />
                  <div className="px-5 pb-4">
                    <button
                      onClick={() => resetBlock(block.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      ↺ Quiz opnieuw maken
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Actieknop onderaan */}
        {saveError && (
          <p className="mt-6 text-sm text-red-600 text-center">{saveError}</p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Overzicht
          </button>

          {data.completed && data.nextStepId ? (
            <button
              onClick={() => router.push(`/onboarding/${data.nextStepId}`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Volgende stap →
            </button>
          ) : data.completed ? (
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              ← Terug naar overzicht
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!allRequiredChecked || saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opslaan...
                </>
              ) : data.nextStepId ? (
                'Volgende stap →'
              ) : (
                'Afronden ✓'
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Flashcard block ──────────────────────────────────────────────────────────

function FlashcardBlock({ title, cards }: { title: string; cards: { question: string; answer: string }[] }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0) {
    return (
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-400">Geen kaartjes beschikbaar</p>
      </div>
    )
  }

  const card = cards[current]

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-400">{current + 1} / {cards.length}</span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-gray-50 rounded-xl p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors min-h-[120px] flex items-center justify-center border border-gray-100"
      >
        <div>
          <p className="text-xs text-gray-400 mb-2">{flipped ? 'Antwoord' : 'Vraag'}</p>
          <p className="text-sm font-medium text-gray-900">{flipped ? card.answer : card.question}</p>
          {!flipped && <p className="text-xs text-gray-400 mt-3">Klik om het antwoord te zien</p>}
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <button
          onClick={() => { setCurrent(Math.max(0, current - 1)); setFlipped(false) }}
          disabled={current === 0}
          className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
        >
          ← Vorige
        </button>
        <button
          onClick={() => { setCurrent(Math.min(cards.length - 1, current + 1)); setFlipped(false) }}
          disabled={current === cards.length - 1}
          className="text-sm text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
        >
          Volgende →
        </button>
      </div>
    </div>
  )
}

// ─── Quiz block ───────────────────────────────────────────────────────────────

function QuizBlock({ title, questions }: { title: string; questions: { question: string; options: string[]; correct: number }[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-400">Geen vragen beschikbaar</p>
      </div>
    )
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length
    : 0

  return (
    <div className="p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-medium text-gray-800 mb-2">
              <span className="text-gray-400 mr-1">{qi + 1}.</span> {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi
                const isCorrect = q.correct === oi
                let style = 'border-gray-200 text-gray-700 hover:border-blue-300'
                if (submitted) {
                  if (isCorrect) style = 'border-green-400 bg-green-50 text-green-800'
                  else if (chosen) style = 'border-red-300 bg-red-50 text-red-700'
                  else style = 'border-gray-100 text-gray-400'
                } else if (chosen) {
                  style = 'border-blue-500 bg-blue-50 text-blue-800'
                }

                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${style} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {submitted && isCorrect && <span className="mr-1.5">✓</span>}
                    {submitted && chosen && !isCorrect && <span className="mr-1.5">✗</span>}
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="mt-5 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Controleer antwoorden
        </button>
      ) : (
        <div className="mt-5 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className={`text-lg ${score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '💪'}`}>
            {score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '💪'}
          </span>
          <p className="text-sm text-gray-700">
            <strong>{score} van {questions.length}</strong> vragen goed
          </p>
        </div>
      )}
    </div>
  )
}
