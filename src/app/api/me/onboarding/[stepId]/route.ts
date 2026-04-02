import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { stepId } = await params

  // Stap + fase
  const { data: step } = await supabaseAdmin
    .from('TemplateStep')
    .select('id, title, description, phase:TemplatePhase(id, title)')
    .eq('id', stepId)
    .single() as {
      data: {
        id: string; title: string; description: string | null;
        phase: { id: string; title: string };
      } | null
    }

  if (!step) return NextResponse.json({ error: 'Stap niet gevonden' }, { status: 404 })

  // Blokken
  const { data: blocks } = await supabaseAdmin
    .from('StepBlock')
    .select('id, type, title, config, order')
    .eq('stepId', stepId)
    .order('order')

  // Instance + voortgang
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id')
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  let completed = false
  let instanceId: string | null = null

  if (instance) {
    instanceId = instance.id
    const { data: progress } = await supabaseAdmin
      .from('StepProgress')
      .select('completed')
      .eq('instanceId', instance.id)
      .eq('stepId', stepId)
      .single()
    completed = progress?.completed ?? false
  }

  // Volgende stap bepalen
  const { data: allSteps } = await supabaseAdmin
    .from('TemplateStep')
    .select('id, order, phaseId')
    .eq('phaseId', step.phase.id)
    .order('order')

  const currentIndex = (allSteps ?? []).findIndex(s => s.id === stepId)
  const nextStep = allSteps?.[currentIndex + 1] ?? null

  return NextResponse.json({
    step: {
      id: step.id,
      title: step.title,
      description: step.description,
      phaseTitle: step.phase.title,
    },
    blocks: blocks ?? [],
    completed,
    instanceId,
    nextStepId: nextStep?.id ?? null,
  })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { stepId } = await params

  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id, templateId')
    .eq('employeeId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (!instance) return NextResponse.json({ error: 'Geen actieve onboarding' }, { status: 404 })

  // Upsert StepProgress
  const { error } = await supabaseAdmin
    .from('StepProgress')
    .upsert(
      { instanceId: instance.id, stepId, completed: true, completedAt: new Date().toISOString() },
      { onConflict: 'instanceId,stepId' }
    )

  if (error) {
    console.error('StepProgress upsert error:', error)
    return NextResponse.json({ error: 'Kon voortgang niet opslaan' }, { status: 500 })
  }

  // Herbereken progressPct
  const { data: allSteps } = await supabaseAdmin
    .from('TemplateStep')
    .select('id, phase:TemplatePhase!inner(templateId)')
    .eq('phase.templateId', instance.templateId)

  const { data: progress } = await supabaseAdmin
    .from('StepProgress')
    .select('stepId')
    .eq('instanceId', instance.id)
    .eq('completed', true)

  const totalSteps = allSteps?.length ?? 0
  const completedCount = progress?.length ?? 0
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  await supabaseAdmin
    .from('OnboardingInstance')
    .update({ progressPct })
    .eq('id', instance.id)

  // Log step completion (fire-and-forget, get companyId from instance)
  const { data: inst } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('companyId')
    .eq('id', instance.id)
    .single()

  await logAudit('step_complete', session.id, inst?.companyId ?? null, {
    stepId,
    instanceId: instance.id,
    progressPct,
  })

  return NextResponse.json({ success: true, progressPct })
}
