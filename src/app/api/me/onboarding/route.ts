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

  if (!instance) return NextResponse.json({ instance: null })

  // Fases + stappen
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order, steps:TemplateStep(id, title, order)')
    .eq('templateId', instance.templateId)
    .order('order')

  // Voortgang
  const { data: progress } = await supabaseAdmin
    .from('StepProgress')
    .select('stepId, completed')
    .eq('instanceId', instance.id)

  const completedStepIds = new Set(
    (progress ?? []).filter(p => p.completed).map(p => p.stepId)
  )

  const allSteps = (phases ?? []).flatMap(p =>
    (p.steps as { id: string; title: string; order: number }[])
  )
  const totalSteps = allSteps.length
  const completedCount = allSteps.filter(s => completedStepIds.has(s.id)).length
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  // Phases unlock sequentially: phase 1 is always active, phase N unlocks when phase N-1 is completed
  let prevPhaseCompleted = true
  const phasesWithStatus = (phases ?? []).map(phase => {
    const steps = (phase.steps as { id: string; title: string; order: number }[])
      .sort((a, b) => a.order - b.order)
    const allDone = steps.length > 0 && steps.every(s => completedStepIds.has(s.id))

    let phaseStatus: 'completed' | 'active' | 'todo'
    if (allDone) {
      phaseStatus = 'completed'
    } else if (prevPhaseCompleted) {
      phaseStatus = 'active'
    } else {
      phaseStatus = 'todo'
    }

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
