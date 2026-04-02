import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

const AT_RISK_DAYS_INACTIVE = 3

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Alle actieve instances voor deze manager
  const { data: instances } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id, status, progressPct, startDate, createdAt,
      employee:User!OnboardingInstance_employeeId_fkey(id, name, email),
      template:Template(name)
    `)
    .eq('managerId', session.id)
    .in('status', ['active', 'at_risk'])
    .order('createdAt', { ascending: false }) as {
      data: Array<{
        id: string; status: string; progressPct: number; startDate: string; createdAt: string;
        employee: { id: string; name: string; email: string };
        template: { name: string };
      }> | null
    }

  if (!instances || instances.length === 0) return NextResponse.json([])

  const instanceIds = instances.map(i => i.id)

  // Laatste activiteit per instance (max completedAt in StepProgress)
  const { data: progressRows } = await supabaseAdmin
    .from('StepProgress')
    .select('instanceId, completedAt')
    .in('instanceId', instanceIds)
    .eq('completed', true)

  const lastActivityByInstance: Record<string, string | null> = {}
  for (const row of progressRows ?? []) {
    const current = lastActivityByInstance[row.instanceId]
    if (!current || (row.completedAt && row.completedAt > current)) {
      lastActivityByInstance[row.instanceId] = row.completedAt
    }
  }

  // Voltooide stappen per instance
  const completedCountByInstance: Record<string, number> = {}
  for (const row of progressRows ?? []) {
    completedCountByInstance[row.instanceId] = (completedCountByInstance[row.instanceId] ?? 0) + 1
  }

  // Overdue taken per instance
  const { data: overdueTasks } = await supabaseAdmin
    .from('Task')
    .select('instanceId')
    .in('instanceId', instanceIds)
    .eq('status', 'overdue')

  const overdueByInstance: Record<string, number> = {}
  for (const task of overdueTasks ?? []) {
    overdueByInstance[task.instanceId] = (overdueByInstance[task.instanceId] ?? 0) + 1
  }

  const now = new Date()

  const team = instances.map(instance => {
    const lastActivity = lastActivityByInstance[instance.id] ?? null
    const overdueTasks = overdueByInstance[instance.id] ?? 0

    const daysSinceActivity = lastActivity
      ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / 86400000)
      : Math.floor((now.getTime() - new Date(instance.createdAt).getTime()) / 86400000)

    const isAtRisk = daysSinceActivity >= AT_RISK_DAYS_INACTIVE || overdueTasks >= 3

    return {
      instanceId: instance.id,
      employee: instance.employee,
      templateName: instance.template.name,
      progressPct: instance.progressPct,
      startDate: instance.startDate,
      lastActivity,
      daysSinceActivity,
      overdueTasks,
      isAtRisk,
    }
  })

  // Update at_risk status in DB waar nodig
  const toMarkAtRisk = team.filter(m => m.isAtRisk).map(m => m.instanceId)
  const toMarkActive = team.filter(m => !m.isAtRisk).map(m => m.instanceId)

  await Promise.all([
    toMarkAtRisk.length > 0 && supabaseAdmin
      .from('OnboardingInstance')
      .update({ status: 'at_risk' })
      .in('id', toMarkAtRisk)
      .eq('status', 'active'),
    toMarkActive.length > 0 && supabaseAdmin
      .from('OnboardingInstance')
      .update({ status: 'active' })
      .in('id', toMarkActive)
      .eq('status', 'at_risk'),
  ])

  return NextResponse.json(team)
}
