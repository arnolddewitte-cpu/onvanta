'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'

type BlockType = 'video' | 'text' | 'task' | 'acknowledgement' | 'flashcards'

interface VideoBlock {
  id: string
  type: 'video'
  title: string
  url: string
}

interface TextBlock {
  id: string
  type: 'text'
  title: string
  body: string
}

interface TaskBlock {
  id: string
  type: 'task'
  title: string
  description: string
}

interface AcknowledgementBlock {
  id: string
  type: 'acknowledgement'
  title: string
  statement: string
}

interface FlashcardsBlock {
  id: string
  type: 'flashcards'
  title: string
  cards: { question: string; answer: string }[]
}

type Block = VideoBlock | TextBlock | TaskBlock | AcknowledgementBlock | FlashcardsBlock

const BLOCK_META: Record<BlockType, { label: string; icon: string; desc: string; color: string; bg: string }> = {
  video:           { label: 'Video',       icon: '▶', desc: 'Embed een video via URL',          color: '#7c3aed', bg: '#f5f3ff' },
  text:            { label: 'Tekst',       icon: '¶', desc: 'Rijke tekstinhoud of instructies', color: '#1d4ed8', bg: '#eff6ff' },
  task:            { label: 'Taak',        icon: '✓', desc: 'Actie die de medewerker uitvoert', color: '#15803d', bg: '#f0fdf4' },
  acknowledgement: { label: 'Bevestiging', icon: '☑', desc: 'Medewerker bevestigt gelezen',    color: '#b45309', bg: '#fffbeb' },
  flashcards:      { label: 'Flashcards',  icon: '⚡', desc: 'Kenniskaarten met spaced rep.',   color: '#db2777', bg: '#fdf2f8' },
}

// Vertaal een DB StepBlock row terug naar een typed Block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBlock(row: { id: string; type: string; title: string; config: any }): Block {
  const { id, type, title, config } = row
  switch (type as BlockType) {
    case 'video':           return { id, type: 'video',           title, url:         config?.url         ?? '' }
    case 'text':            return { id, type: 'text',            title, body:        config?.body        ?? '' }
    case 'task':            return { id, type: 'task',            title, description: config?.description ?? '' }
    case 'acknowledgement': return { id, type: 'acknowledgement', title, statement:   config?.statement   ?? '' }
    case 'flashcards':      return { id, type: 'flashcards',      title, cards:       config?.cards       ?? [] }
    default:                return { id, type: 'text',            title, body: '' }
  }
}

export default function StepEditorPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; stepId: string }>
}) {
  const params = use(paramsPromise)

  const [stepTitle, setStepTitle] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/steps/${params.stepId}/blocks`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return }
        setStepTitle(data.step.title)
        setBlocks((data.blocks ?? []).map(rowToBlock))
      })
      .catch(() => setLoadError('Kon stap niet laden'))
      .finally(() => setLoading(false))
  }, [params.stepId])

  function addBlock(type: BlockType) {
    const id = Date.now().toString()
    let block: Block

    switch (type) {
      case 'video':
        block = { id, type, title: 'Nieuwe video', url: '' }
        break
      case 'text':
        block = { id, type, title: 'Nieuwe tekst', body: '' }
        break
      case 'task':
        block = { id, type, title: 'Nieuwe taak', description: '' }
        break
      case 'acknowledgement':
        block = { id, type, title: 'Bevestiging', statement: 'Ik heb deze stap voltooid en begrijp de inhoud.' }
        break
      case 'flashcards':
        block = { id, type, title: 'Flashcards', cards: [{ question: '', answer: '' }] }
        break
    }

    setBlocks([...blocks, block])
    setShowPicker(false)
  }

  function deleteBlock(id: string) {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  function updateBlock(id: string, fields: Partial<Block>) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...fields } as Block : b))
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex(b => b.id === id)
    if (idx + dir < 0 || idx + dir >= blocks.length) return
    const next = [...blocks]
    ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
    setBlocks(next)
  }

  function addFlashcard(blockId: string) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId || b.type !== 'flashcards') return b
      return { ...b, cards: [...b.cards, { question: '', answer: '' }] }
    }))
  }

  function updateFlashcard(blockId: string, cardIdx: number, field: 'question' | 'answer', value: string) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId || b.type !== 'flashcards') return b
      const cards = b.cards.map((c, i) => i === cardIdx ? { ...c, [field]: value } : c)
      return { ...b, cards }
    }))
  }

  function deleteFlashcard(blockId: string, cardIdx: number) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId || b.type !== 'flashcards') return b
      return { ...b, cards: b.cards.filter((_, i) => i !== cardIdx) }
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')

    // Zet elk blok om naar het formaat dat de API verwacht
    const payload = blocks.map(block => {
      const base = { type: block.type, title: block.title }
      switch (block.type) {
        case 'video':           return { ...base, url: block.url }
        case 'text':            return { ...base, body: block.body }
        case 'task':            return { ...base, description: block.description }
        case 'acknowledgement': return { ...base, statement: block.statement }
        case 'flashcards':      return { ...base, cards: block.cards }
      }
    })

    try {
      const res = await fetch(`/api/admin/steps/${params.stepId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: payload }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.detail || data.error || 'Er ging iets mis')
        console.error('Save error:', data)
        return
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: 'DM Sans, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: '#7a7a78' }}>Laden...</span>
    </main>
  )

  if (loadError) return (
    <main style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: 'DM Sans, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: '#dc2626' }}>{loadError}</span>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f8f8f7', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* Topbar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e7e2', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href={`/admin/templates/${params.id}/edit`}
            style={{ color: '#7a7a78', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Template
          </Link>
          <span style={{ color: '#d0cfc9', fontSize: 13 }}>/</span>
          <input
            value={stepTitle}
            onChange={e => setStepTitle(e.target.value)}
            style={{ fontSize: 15, fontWeight: 600, color: '#0f0f0e', border: 'none', outline: 'none', background: 'transparent', minWidth: 200 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveError && (
            <span style={{ fontSize: 12, color: '#dc2626' }}>{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saved ? '#16a34a' : '#1a5fd4',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 500,
              cursor: saving ? 'default' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              opacity: saving ? 0.6 : 1,
              transition: 'background .15s',
            }}
          >
            {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : 'Opslaan'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px' }}>

        {/* Blocks list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {blocks.map((block, idx) => {
            const meta = BLOCK_META[block.type]
            return (
              <div
                key={block.id}
                style={{ background: 'white', border: '1px solid #e8e7e2', borderRadius: 14, overflow: 'hidden' }}
              >
                {/* Block header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0efea', background: '#fafaf9' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', color: meta.color }}>
                    {meta.label}
                  </span>
                  <div style={{ flex: 1 }} />
                  {/* Move up/down */}
                  <button onClick={() => moveBlock(block.id, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#d0cfc9' : '#7a7a78', fontSize: 14, padding: '2px 6px' }}>↑</button>
                  <button onClick={() => moveBlock(block.id, 1)} disabled={idx === blocks.length - 1} style={{ background: 'none', border: 'none', cursor: idx === blocks.length - 1 ? 'default' : 'pointer', color: idx === blocks.length - 1 ? '#d0cfc9' : '#7a7a78', fontSize: 14, padding: '2px 6px' }}>↓</button>
                  <button onClick={() => deleteBlock(block.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0bfba', fontSize: 18, padding: '2px 6px', lineHeight: 1 }}>×</button>
                </div>

                {/* Block fields */}
                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                  {/* Shared: title */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Titel</label>
                    <input
                      value={block.title}
                      onChange={e => updateBlock(block.id, { title: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Video: URL */}
                  {block.type === 'video' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Video URL</label>
                      <input
                        type="url"
                        value={block.url}
                        onChange={e => updateBlock(block.id, { url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                      />
                      {block.url && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#f5f3ff', borderRadius: 8, fontSize: 12, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>▶</span>
                          <a href={block.url} target="_blank" rel="noreferrer" style={{ color: '#7c3aed', textDecoration: 'none' }}>{block.url}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text: body */}
                  {block.type === 'text' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Inhoud</label>
                      <textarea
                        value={block.body}
                        onChange={e => updateBlock(block.id, { body: e.target.value })}
                        rows={5}
                        placeholder="Schrijf hier de tekst of instructies..."
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {/* Task: description */}
                  {block.type === 'task' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Beschrijving</label>
                      <textarea
                        value={block.description}
                        onChange={e => updateBlock(block.id, { description: e.target.value })}
                        rows={3}
                        placeholder="Wat moet de medewerker doen?"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  {/* Acknowledgement: statement */}
                  {block.type === 'acknowledgement' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.4px' }}>Bevestigingstekst</label>
                      <input
                        value={block.statement}
                        onChange={e => updateBlock(block.id, { statement: e.target.value })}
                        placeholder="Ik heb deze stap voltooid en begrijp de inhoud."
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #e8e7e2', borderRadius: 8, fontSize: 14, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                        <div style={{ width: 16, height: 16, border: '2px solid #b45309', borderRadius: 3, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#92400e' }}>{block.statement || 'Bevestigingstekst verschijnt hier'}</span>
                      </div>
                    </div>
                  )}

                  {/* Flashcards */}
                  {block.type === 'flashcards' && (
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7a7a78', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.4px' }}>Kaarten ({block.cards.length})</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {block.cards.map((card, ci) => (
                          <div key={ci} style={{ border: '1px solid #e8e7e2', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                              <div style={{ padding: '10px 12px', borderRight: '1px solid #e8e7e2' }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#db2777', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Vraag</div>
                                <textarea
                                  value={card.question}
                                  onChange={e => updateFlashcard(block.id, ci, 'question', e.target.value)}
                                  rows={2}
                                  placeholder="Wat is...?"
                                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', background: 'transparent', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div style={{ padding: '10px 12px', position: 'relative' }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: '#7a7a78', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Antwoord</div>
                                <textarea
                                  value={card.answer}
                                  onChange={e => updateFlashcard(block.id, ci, 'answer', e.target.value)}
                                  rows={2}
                                  placeholder="Het antwoord..."
                                  style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: '#0f0f0e', fontFamily: 'DM Sans, sans-serif', background: 'transparent', boxSizing: 'border-box' }}
                                />
                                {block.cards.length > 1 && (
                                  <button
                                    onClick={() => deleteFlashcard(block.id, ci)}
                                    style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#c0bfba', fontSize: 16, lineHeight: 1 }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addFlashcard(block.id)}
                        style={{ marginTop: 8, width: '100%', padding: '8px', background: 'none', border: '1px dashed #f9a8d4', borderRadius: 8, color: '#db2777', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        + Kaart toevoegen
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

        {/* Add block */}
        {!showPicker ? (
          <button
            onClick={() => setShowPicker(true)}
            style={{ width: '100%', padding: '13px', background: 'white', border: '2px dashed #e8e7e2', borderRadius: 14, color: '#7a7a78', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s, color .15s' }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a5fd4'; (e.currentTarget as HTMLButtonElement).style.color = '#1a5fd4' }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e8e7e2'; (e.currentTarget as HTMLButtonElement).style.color = '#7a7a78' }}
          >
            + Blok toevoegen
          </button>
        ) : (
          <div style={{ background: 'white', border: '1px solid #e8e7e2', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0efea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e' }}>Kies een bloktype</span>
              <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a78', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#f0efea' }}>
              {(Object.entries(BLOCK_META) as [BlockType, typeof BLOCK_META[BlockType]][]).map(([type, meta]) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  style={{ background: 'white', border: 'none', padding: '16px 18px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 12, fontFamily: 'DM Sans, sans-serif' }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = '#fafaf9'}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = 'white'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                    {meta.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0f0e', marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 12, color: '#7a7a78', lineHeight: 1.4 }}>{meta.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
