import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type BlockType = 'video' | 'text' | 'task' | 'acknowledgement' | 'flashcards'

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
      return NextResponse.json({ error: 'Kon bestaande blokken niet verwijderen' }, { status: 500 })
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
      return NextResponse.json({ error: 'Kon blokken niet opslaan' }, { status: 500 })
    }

    return NextResponse.json({ success: true, blocks: data })

  } catch (err) {
    console.error('Blocks save error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
