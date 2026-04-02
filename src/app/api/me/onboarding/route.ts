import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Actieve instance
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id, progressPct, templateId')
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  console.log('[onboarding] instance:', instance)

  if (!instance) return NextResponse.json({ instance: null })

  // Fases (apart ophalen, geen nested join)
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order')
    .eq('templateId', instance.templateId)
    .order('order')

  console.log('[onboarding] phases:', phases?.length, phases?.map(p => p.title))

  // Stappen per fase (apart ophalen om nested join problemen te vermijden)
  const phaseIds = (phases ?? []).map(p => p.id)
  const { data: allStepsRaw } = phaseIds.length > 0
    ? await supabaseAdmin
        .from('TemplateStep')
        .select('id, title, order, phaseId')
        .in('phaseId', phaseIds)
        .order('order')
    : { data: [] }

  console.log('[onboarding] allStepsRaw:', allStepsRaw?.length, allStepsRaw?.map(s => s.title))

  // Group steps per phaseId
  const stepsByPhase: Record<string, { id: string; title: string; order: number }[]> = {}
  for (const step of allStepsRaw ?? []) {
    if (!stepsByPhase[step.phaseId]) stepsByPhase[step.phaseId] = []
    stepsByPhase[step.phaseId].push(step)
  }

  // Voortgang
  const { data: progress } = await supabaseAdmin
    .from('StepProgress')
    .select('stepId, completed')
    .eq('instanceId', instance.id)

  console.log('[onboarding] progress records:', progress?.length)

  const completedStepIds = new Set(
    (progress ?? []).filter(p => p.completed).map(p => p.stepId)
  )

  console.log('[onboarding] completedStepIds:', [...completedStepIds])

  const allSteps = allStepsRaw ?? []
  const totalSteps = allSteps.length
  const completedCount = allSteps.filter(s => completedStepIds.has(s.id)).length
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  console.log('[onboarding] progress calc:', { totalSteps, completedCount, progressPct })

  // Phases unlock sequentially: phase 1 is always active, phase N unlocks when phase N-1 is completed
  let prevPhaseCompleted = true
  const phasesWithStatus = (phases ?? []).map(phase => {
    const steps = (stepsByPhase[phase.id] ?? []).sort((a, b) => a.order - b.order)
    const allDone = steps.length > 0 && steps.every(s => completedStepIds.has(s.id))

    let phaseStatus: 'completed' | 'active' | 'todo'
    if (allDone) {
      phaseStatus = 'completed'
    } else if (prevPhaseCompleted) {
      phaseStatus = 'active'
    } else {
      phaseStatus = 'todo'
    }

    console.log(`[onboarding] phase "${phase.title}": steps=${steps.length}, allDone=${allDone}, prevCompleted=${prevPhaseCompleted}, status=${phaseStatus}`)

    prevPhaseCompleted = allDone

    return {
      id: phase.id,
      title: phase.title,
      status: phaseStatus,
      steps: steps.map(s => ({
        id: s.id,
        title: s.title,
        status: completedStepIds.has(s.id) ? 'completed' : 'todo',
      })),
    }
  })

  return NextResponse.json({
    instanceId: instance.id,
    progressPct,
    totalSteps,
    completedCount,
    phases: phasesWithStatus,
  })
}
