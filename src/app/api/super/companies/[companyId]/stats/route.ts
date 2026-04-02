import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params

  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  // Get all instance IDs for this company
  const { data: instances } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id')
    .eq('companyId', companyId)

  const instanceIds = (instances ?? []).map(i => i.id)

  // Pre-fill last 30 days with 0
  const byDate: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    byDate[d.toISOString().slice(0, 10)] = 0
  }

  if (instanceIds.length > 0) {
    const { data } = await supabaseAdmin
      .from('StepProgress')
      .select('completedAt')
      .in('instanceId', instanceIds)
      .eq('completed', true)
      .not('completedAt', 'is', null)
      .gte('completedAt', since.toISOString())

    for (const row of data ?? []) {
      const day = (row.completedAt as string).slice(0, 10)
      if (day in byDate) byDate[day] = (byDate[day] ?? 0) + 1
    }
  }

  const result = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  return NextResponse.json(result)
}
