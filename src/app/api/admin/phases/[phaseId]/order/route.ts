import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { phaseId } = await params
  const { direction } = await req.json()

  // Haal huidige fase op
  const { data: phase } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, order, templateId')
    .eq('id', phaseId)
    .single()

  if (!phase) return NextResponse.json({ error: 'Fase niet gevonden' }, { status: 404 })

  // Zoek de buurman (hogere of lagere order in dezelfde template)
  const { data: neighbor } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, order')
    .eq('templateId', phase.templateId)
    .eq('order', direction === 'up' ? phase.order - 1 : phase.order + 1)
    .single()

  if (!neighbor) return NextResponse.json({ error: 'Kan niet verder verschuiven' }, { status: 400 })

  // Wissel orders
  await Promise.all([
    supabaseAdmin.from('TemplatePhase').update({ order: neighbor.order }).eq('id', phase.id),
    supabaseAdmin.from('TemplatePhase').update({ order: phase.order }).eq('id', neighbor.id),
  ])

  return NextResponse.json({ success: true })
}
