import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: templates, error } = await supabaseAdmin
    .from('Template')
    .select(`
      id, name, description, published, updatedAt, companyId,
      phases:TemplatePhase(
        id,
        steps:TemplateStep(id)
      )
    `)
    .order('updatedAt', { ascending: false })

  if (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json({ error: 'Kon templates niet ophalen' }, { status: 500 })
  }

  const result = (templates ?? []).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    published: t.published,
    updatedAt: t.updatedAt,
    companyId: t.companyId,
    phaseCount: t.phases?.length ?? 0,
    stepCount: t.phases?.reduce((acc: number, p: { steps: { id: string }[] }) => acc + (p.steps?.length ?? 0), 0) ?? 0,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { name, description, companyId } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
  }

  // companyId meegegeven vanuit frontend; als ontbreekt, pak de eerste company
  let resolvedCompanyId = companyId
  if (!resolvedCompanyId) {
    const { data: company } = await supabaseAdmin
      .from('Company')
      .select('id')
      .limit(1)
      .single()
    if (!company) {
      return NextResponse.json({ error: 'Geen company gevonden' }, { status: 500 })
    }
    resolvedCompanyId = company.id
  }

  const { data: template, error } = await supabaseAdmin
    .from('Template')
    .insert({
      name: name.trim(),
      description: description?.trim() ?? '',
      companyId: resolvedCompanyId,
      published: false,
    })
    .select()
    .single()

  if (error || !template) {
    console.error('Template create error:', error)
    return NextResponse.json(
      { error: 'Kon template niet aanmaken', detail: error?.message },
      { status: 500 }
    )
  }

  return NextResponse.json(template, { status: 201 })
}
