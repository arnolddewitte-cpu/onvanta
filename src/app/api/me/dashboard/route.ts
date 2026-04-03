import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  // 1. Actieve OnboardingInstance van deze medewerker
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, progressPct, startDate,
      template:Template(id, name),
      manager:User!OnboardingInstance_managerId_fkey(id, name)
    `)
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single() as { data: {
      id: string; status: string; progressPct: number; startDate: string;
      template: { id: string; name: string };
      manager: { id: string; name: string } | null;
    } | null }

  if (!instance) {
    return NextResponse.json({ instance: null })
  }

  // 2. Fases (apart ophalen)
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order')
    .eq('templateId', instance.template.id)
    .order('order')

  // 3. Stappen per fase (apart ophalen om nested join problemen te vermijden)
  const phaseIds = (phases ?? []).map(p => p.id)
  const { data: stepsRaw } = phaseIds.length > 0
    ? await supabaseAdmin
        .from('TemplateStep')
        .select('id, title, order, phaseId')
        .in('phaseId', phaseIds)
        .order('order')
    : { data: [] }

  // Enriched stappen met phaseTitle
  const phaseById = Object.fromEntries((phases ?? []).map(p => [p.id, p]))
  const allSteps = (stepsRaw ?? []).map(s => ({
    ...s,
    phaseTitle: phaseById[s.phaseId]?.title ?? '',
    phaseOrder: phaseById[s.phaseId]?.order ?? 0,
  })).sort((a, b) => a.phaseOrder - b.phaseOrder || a.order - b.order)

  // 4. Voortgang
  const { data: progress } = await supabaseAdmin
    .from('StepProgress')
    .select('stepId, completed')
    .eq('instanceId', instance.id)

  const completedStepIds = new Set(
    (progress ?? []).filter(p => p.completed).map(p => p.stepId)
  )

  const totalSteps = allSteps.length
  const completedCount = allSteps.filter(s => completedStepIds.has(s.id)).length
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  // 5. Huidige fase = eerste fase met onvoltooide stappen
  let currentPhaseTitle = phases?.[0]?.title ?? ''
  for (const phase of phases ?? []) {
    const phaseSteps = allSteps.filter(s => s.phaseId === phase.id)
    const hasIncomplete = phaseSteps.some(s => !completedStepIds.has(s.id))
    if (hasIncomplete) {
      currentPhaseTitle = phase.title
      break
    }
  }

  // 6. Taken vandaag = eerste 5 onvoltooide stappen
  const todoSteps = allSteps
    .filter(s => !completedStepIds.has(s.id))
    .slice(0, 5)

  const todoStepIds = todoSteps.map(s => s.id)
  const { data: blocks } = todoStepIds.length > 0
    ? await supabaseAdmin
        .from('StepBlock')
        .select('stepId, type')
        .in('stepId', todoStepIds)
        .order('order')
    : { data: [] }

  const blocksByStep: Record<string, string[]> = {}
  for (const block of blocks ?? []) {
    if (!blocksByStep[block.stepId]) blocksByStep[block.stepId] = []
    blocksByStep[block.stepId].push(block.type)
  }

  const todayTasks = todoSteps.map(s => ({
    stepId: s.id,
    title: s.title,
    phaseTitle: s.phaseTitle,
    blockTypes: blocksByStep[s.id] ?? [],
    done: false,
  }))

  // 7. Flashcards — stappen met flashcard blokken
  const allStepIds = allSteps.map(s => s.id)
  const { data: flashcardBlocks } = allStepIds.length > 0
    ? await supabaseAdmin
        .from('StepBlock')
        .select('stepId, config, title')
        .eq('type', 'flashcards')
        .in('stepId', allStepIds)
    : { data: [] }

  const flashcardSteps = (flashcardBlocks ?? [])
    .filter(b => !completedStepIds.has(b.stepId))
    .slice(0, 3)
    .map(b => ({
      stepId: b.stepId,
      title: b.title,
      cardCount: Array.isArray((b.config as { cards?: unknown[] })?.cards)
        ? (b.config as { cards: unknown[] }).cards.length
        : 0,
    }))

  return NextResponse.json({
    user: { name: session.email.split('@')[0], email: session.email },
    instance: {
      id: instance.id,
      status: instance.status,
      progressPct,
      startDate: instance.startDate,
      templateName: instance.template.name,
      managerName: instance.manager?.name ?? null,
      currentPhaseTitle,
      totalSteps,
      completedCount,
    },
    todayTasks,
    flashcardSteps,
  })
}
