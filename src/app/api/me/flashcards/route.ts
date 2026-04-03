import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Actieve instance
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id, templateId')
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (!instance) return NextResponse.json({ instance: null, cards: [] })

  // Alle fase IDs voor dit template
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id')
    .eq('templateId', instance.templateId)

  const phaseIds = (phases ?? []).map(p => p.id)
  if (phaseIds.length === 0) return NextResponse.json({ instance: instance.id, cards: [] })

  // Alle stap IDs voor deze fases
  const { data: steps } = await supabaseAdmin
    .from('TemplateStep')
    .select('id')
    .in('phaseId', phaseIds)

  const stepIds = (steps ?? []).map(s => s.id)
  if (stepIds.length === 0) return NextResponse.json({ instance: instance.id, cards: [] })

  // Alle flashcard blokken voor deze stappen
  const { data: flashcardBlocks } = await supabaseAdmin
    .from('StepBlock')
    .select('id, stepId, title, config')
    .eq('type', 'flashcards')
    .in('stepId', stepIds)

  // Flatten alle kaarten
  const cards: { question: string; answer: string; setTitle: string }[] = []
  for (const block of flashcardBlocks ?? []) {
    const blockCards = (block.config as { cards?: { question: string; answer: string }[] })?.cards ?? []
    for (const card of blockCards) {
      if (card.question && card.answer) {
        cards.push({
          question: card.question,
          answer: card.answer,
          setTitle: block.title,
        })
      }
    }
  }

  return NextResponse.json({ instance: instance.id, cards })
}
