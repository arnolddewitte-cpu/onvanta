import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session || !['company_admin', 'manager', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: templates, error } = await supabaseAdmin
    .from('Template')
    .select('id, name, description, published, updatedAt, isGlobal')
    .eq('isGlobal', true)
    .order('name')

  if (error) {
    console.error('Library fetch error:', error)
    return NextResponse.json({ error: 'Kon bibliotheek niet ophalen' }, { status: 500 })
  }

  const templateIds = (templates ?? []).map(t => t.id)

  const { data: phases } = templateIds.length > 0
    ? await supabaseAdmin.from('TemplatePhase').select('id, templateId').in('templateId', templateIds)
    : { data: [] }

  const phaseIds = (phases ?? []).map(p => p.id)
  const { data: steps } = phaseIds.length > 0
    ? await supabaseAdmin.from('TemplateStep').select('id, phaseId').in('phaseId', phaseIds)
    : { data: [] }

  const phasesByTemplate: Record<string, number> = {}
  const phaseToTemplate: Record<string, string> = {}
  for (const p of phases ?? []) {
    phasesByTemplate[p.templateId] = (phasesByTemplate[p.templateId] ?? 0) + 1
    phaseToTemplate[p.id] = p.templateId
  }
  const stepsByTemplate: Record<string, number> = {}
  for (const s of steps ?? []) {
    const tid = phaseToTemplate[s.phaseId]
    if (tid) stepsByTemplate[tid] = (stepsByTemplate[tid] ?? 0) + 1
  }

  const result = (templates ?? []).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    phaseCount: phasesByTemplate[t.id] ?? 0,
    stepCount: stepsByTemplate[t.id] ?? 0,
  }))

  return NextResponse.json(result)
}
