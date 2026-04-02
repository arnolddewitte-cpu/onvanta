import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: companies, error } = await supabaseAdmin
    .from('Company')
    .select(`
      id, name, slug, plan, status, createdAt, trialEndsAt,
      users:User(count),
      onboardings:OnboardingInstance(count),
      templates:Template(count)
    `)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Super companies error:', error)
    return NextResponse.json({ error: 'Kon companies niet laden' }, { status: 500 })
  }

  const result = (companies ?? []).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    plan: c.plan,
    status: c.status,
    createdAt: c.createdAt,
    trialEndsAt: c.trialEndsAt,
    userCount: (c.users as unknown as { count: number }[])[0]?.count ?? 0,
    onboardingCount: (c.onboardings as unknown as { count: number }[])[0]?.count ?? 0,
    templateCount: (c.templates as unknown as { count: number }[])[0]?.count ?? 0,
  }))

  return NextResponse.json(result)
}
