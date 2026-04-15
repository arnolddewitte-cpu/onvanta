import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session || !['company_admin', 'manager', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const companyId = session.companyId
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { count: activeOnboardings },
    { count: completedThisMonth },
    { count: atRisk },
    { count: templates },
    { data: recentOnboardings },
  ] = await Promise.all([
    supabaseAdmin
      .from('OnboardingInstance')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', companyId)
      .eq('status', 'active'),

    supabaseAdmin
      .from('OnboardingInstance')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', companyId)
      .eq('status', 'completed')
      .gte('updatedAt', startOfMonth),

    supabaseAdmin
      .from('OnboardingInstance')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', companyId)
      .eq('status', 'at_risk'),

    supabaseAdmin
      .from('Template')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', companyId),

    supabaseAdmin
      .from('OnboardingInstance')
      .select('id, status, progressPct, startDate, employee:employeeId(name), template:templateId(name)')
      .eq('companyId', companyId)
      .in('status', ['active', 'at_risk'])
      .order('startDate', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    stats: {
      activeOnboardings: activeOnboardings ?? 0,
      completedThisMonth: completedThisMonth ?? 0,
      atRisk: atRisk ?? 0,
      templates: templates ?? 0,
    },
    recentOnboardings: (recentOnboardings ?? []).map((o: Record<string, unknown>) => {
      const employee = o.employee as { name?: string } | null
      const template = o.template as { name?: string } | null
      return {
        id: o.id,
        name: employee?.name ?? 'Onbekend',
        role: template?.name ?? '',
        progress: o.progressPct ?? 0,
        status: o.status === 'at_risk' ? 'at_risk' : 'on_track',
        phase: '',
      }
    }),
  })
}
