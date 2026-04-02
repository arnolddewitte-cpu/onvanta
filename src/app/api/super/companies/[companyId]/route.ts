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

  const [
    { data: company },
    { data: users },
    { data: templates },
    { data: onboardings },
  ] = await Promise.all([
    supabaseAdmin
      .from('Company')
      .select('id, name, slug, plan, status, createdAt, trialEndsAt, stripeCustomerId')
      .eq('id', companyId)
      .single(),

    supabaseAdmin
      .from('User')
      .select('id, name, email, role, createdAt')
      .eq('companyId', companyId)
      .order('createdAt'),

    supabaseAdmin
      .from('Template')
      .select('id, name, published, createdAt')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false }),

    supabaseAdmin
      .from('OnboardingInstance')
      .select(`
        id, status, progressPct, startDate, createdAt,
        employee:User!OnboardingInstance_employeeId_fkey(name, email),
        template:Template(name)
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false })
      .limit(20),
  ])

  if (!company) return NextResponse.json({ error: 'Company niet gevonden' }, { status: 404 })

  return NextResponse.json({
    company,
    users: users ?? [],
    templates: templates ?? [],
    onboardings: (onboardings ?? []).map(o => {
      const emp = o.employee as unknown as { name: string; email: string } | null
      const tpl = o.template as unknown as { name: string } | null
      return {
        id: o.id,
        status: o.status,
        progressPct: o.progressPct,
        startDate: o.startDate,
        createdAt: o.createdAt,
        employeeName: emp?.name ?? '—',
        employeeEmail: emp?.email ?? '',
        templateName: tpl?.name ?? '—',
      }
    }),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params
  const { status } = await req.json()

  const validStatuses = ['trial', 'active', 'paused', 'cancelled']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('Company')
    .update({ status })
    .eq('id', companyId)

  if (error) return NextResponse.json({ error: 'Kon status niet bijwerken' }, { status: 500 })

  return NextResponse.json({ success: true })
}
