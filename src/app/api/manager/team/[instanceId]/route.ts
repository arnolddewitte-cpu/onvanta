import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { instanceId } = await params

  // Instance — controleer dat manager deze mag zien
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, progressPct, startDate,
      employee:User!OnboardingInstance_employeeId_fkey(id, name, email),
      template:Template(id, name)
    `)
    .eq('id', instanceId)
    .eq('managerId', session.id)
    .single() as {
      data: {
        id: string; status: string; progressPct: number; startDate: string;
        employee: { id: string; name: string; email: string };
        template: { id: string; name: string };
      } | null
    }

  if (!instance) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  // Fases + stappen
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order, steps:TemplateStep(id, title, order)')
    .eq('templateId', instance.template.id)
    .order('order')

  // Voltooide stappen
  const { data: progress } = await supabaseAdmin
    .from('StepProgress')
    .select('stepId, completed, completedAt')
    .eq('instanceId', instanceId)

  const completedMap: Record<string, string | null> = {}
  for (const p of progress ?? []) {
    if (p.completed) completedMap[p.stepId] = p.completedAt
  }

  // Laatste activiteit
  const lastActivity = Object.values(completedMap)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

  const now = new Date()
  const daysSinceActivity = lastActivity
    ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / 86400000)
    : null

  // Fases met voortgang
  const phasesWithProgress = (phases ?? []).map(phase => {
    const steps = (phase.steps as { id: string; title: string; order: number }[]).map(s => ({
      id: s.id,
      title: s.title,
      completed: !!completedMap[s.id],
      completedAt: completedMap[s.id] ?? null,
    }))
    const phaseTotal = steps.length
    const phaseCompleted = steps.filter(s => s.completed).length
    return {
      id: phase.id,
      title: phase.title,
      steps,
      completedCount: phaseCompleted,
      totalCount: phaseTotal,
      progressPct: phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0,
    }
  })

  const totalSteps = phasesWithProgress.reduce((acc, p) => acc + p.totalCount, 0)
  const completedSteps = phasesWithProgress.reduce((acc, p) => acc + p.completedCount, 0)

  // Taken
  const { data: tasks } = await supabaseAdmin
    .from('Task')
    .select('id, title, status, dueDate')
    .eq('instanceId', instanceId)
    .order('createdAt')

  const overdueTasks = (tasks ?? []).filter(t => t.status === 'overdue').length
  const isAtRisk = (daysSinceActivity !== null && daysSinceActivity >= 3) || overdueTasks >= 3

  return NextResponse.json({
    instance: {
      id: instance.id,
      status: instance.status,
      progressPct: instance.progressPct,
      startDate: instance.startDate,
      isAtRisk,
      lastActivity,
      daysSinceActivity,
    },
    employee: instance.employee,
    templateName: instance.template.name,
    phases: phasesWithProgress,
    totalSteps,
    completedSteps,
    overdueTasks,
    tasks: (tasks ?? []).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate,
    })),
  })
}
