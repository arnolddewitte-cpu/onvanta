import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { stepId } = await params
  const { direction } = await req.json()

  // Haal huidige stap op
  const { data: step } = await supabaseAdmin
    .from('TemplateStep')
    .select('id, order, phaseId')
    .eq('id', stepId)
    .single()

  if (!step) return NextResponse.json({ error: 'Stap niet gevonden' }, { status: 404 })

  // Zoek de buurman in dezelfde fase
  const { data: neighbor } = await supabaseAdmin
    .from('TemplateStep')
    .select('id, order')
    .eq('phaseId', step.phaseId)
    .eq('order', direction === 'up' ? step.order - 1 : step.order + 1)
    .single()

  if (!neighbor) return NextResponse.json({ error: 'Kan niet verder verschuiven' }, { status: 400 })

  // Wissel orders
  await Promise.all([
    supabaseAdmin.from('TemplateStep').update({ order: neighbor.order }).eq('id', step.id),
    supabaseAdmin.from('TemplateStep').update({ order: step.order }).eq('id', neighbor.id),
  ])

  return NextResponse.json({ success: true })
}
