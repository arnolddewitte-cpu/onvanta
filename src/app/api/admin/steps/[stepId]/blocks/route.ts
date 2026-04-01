import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type BlockType = 'video' | 'text' | 'task' | 'acknowledgement' | 'flashcards'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const { stepId } = await params

  const [{ data: step, error: stepError }, { data: blocks, error: blocksError }] =
    await Promise.all([
      supabaseAdmin
        .from('TemplateStep')
        .select('id, title')
        .eq('id', stepId)
        .single(),
      supabaseAdmin
        .from('StepBlock')
        .select('id, type, title, config, order')
        .eq('stepId', stepId)
        .order('order'),
    ])

  if (stepError) {
    return NextResponse.json({ error: 'Stap niet gevonden' }, { status: 404 })
  }

  return NextResponse.json({ step, blocks: blocks ?? [] })
}

interface IncomingBlock {
  type: BlockType
  title: string
  url?: string
  body?: string
  description?: string
  statement?: string
  cards?: { question: string; answer: string }[]
}

function buildConfig(block: IncomingBlock): Record<string, unknown> {
  switch (block.type) {
    case 'video':
      return { url: block.url ?? '' }
    case 'text':
      return { body: block.body ?? '' }
    case 'task':
      return { description: block.description ?? '' }
    case 'acknowledgement':
      return { statement: block.statement ?? '' }
    case 'flashcards':
      return { cards: block.cards ?? [] }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId } = await params
    const { blocks }: { blocks: IncomingBlock[] } = await req.json()

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'blocks moet een array zijn' }, { status: 400 })
    }

    // 1. Verwijder alle bestaande blokken voor deze stap
    const { error: deleteError } = await supabaseAdmin
      .from('StepBlock')
      .delete()
      .eq('stepId', stepId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Kon bestaande blokken niet verwijderen', detail: deleteError.message, code: deleteError.code },
        { status: 500 }
      )
    }

    // 2. Voeg de nieuwe blokken in
    if (blocks.length === 0) {
      return NextResponse.json({ success: true, blocks: [] })
    }

    const rows = blocks.map((block, idx) => ({
      stepId,
      type: block.type,
      title: block.title,
      order: idx,
      required: true,
      config: buildConfig(block),
    }))

    const { data, error: insertError } = await supabaseAdmin
      .from('StepBlock')
      .insert(rows)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Kon blokken niet opslaan', detail: insertError.message, code: insertError.code, hint: insertError.hint },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, blocks: data })

  } catch (err) {
    console.error('Blocks save error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
