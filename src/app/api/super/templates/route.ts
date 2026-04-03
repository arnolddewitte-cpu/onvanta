import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// GET: alle globale templates voor super admin beheer
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: templates, error } = await supabaseAdmin
    .from('Template')
    .select('id, name, description, published, isGlobal, companyId, updatedAt')
    .order('isGlobal', { ascending: false })
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Kon templates niet ophalen' }, { status: 500 })
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

  return NextResponse.json((templates ?? []).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    published: t.published,
    isGlobal: t.isGlobal,
    companyId: t.companyId,
    phaseCount: phasesByTemplate[t.id] ?? 0,
    stepCount: stepsByTemplate[t.id] ?? 0,
  })))
}

// POST: maak een nieuw globaal template aan (super admin)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { name, description } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })

  const { data: template, error } = await supabaseAdmin
    .from('Template')
    .insert({
      name: name.trim(),
      description: description?.trim() ?? '',
      companyId: session.companyId,
      published: false,
      isGlobal: true,
    })
    .select('id')
    .single()

  if (error || !template) {
    return NextResponse.json({ error: 'Kon template niet aanmaken' }, { status: 500 })
  }

  return NextResponse.json({ id: template.id }, { status: 201 })
}
