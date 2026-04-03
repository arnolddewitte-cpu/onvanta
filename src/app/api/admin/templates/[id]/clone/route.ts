import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || !['company_admin', 'manager', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id: sourceId } = await params

  // Haal bron-template op (moet globaal zijn)
  const { data: source, error: sourceError } = await supabaseAdmin
    .from('Template')
    .select('id, name, description, isGlobal')
    .eq('id', sourceId)
    .single()

  if (sourceError || !source) {
    return NextResponse.json({ error: 'Template niet gevonden' }, { status: 404 })
  }
  if (!source.isGlobal) {
    return NextResponse.json({ error: 'Alleen globale templates kunnen gekloond worden' }, { status: 400 })
  }

  // Maak kopie van het template voor het bedrijf van de gebruiker
  const { data: newTemplate, error: tmplError } = await supabaseAdmin
    .from('Template')
    .insert({
      name: source.name,
      description: source.description,
      companyId: session.companyId,
      published: false,
      isGlobal: false,
    })
    .select('id')
    .single()

  if (tmplError || !newTemplate) {
    console.error('Clone template error:', tmplError)
    return NextResponse.json({ error: 'Kon template niet kopiëren' }, { status: 500 })
  }

  // Haal fases op
  const { data: phases } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order')
    .eq('templateId', sourceId)
    .order('order')

  for (const phase of phases ?? []) {
    const { data: newPhase, error: phaseError } = await supabaseAdmin
      .from('TemplatePhase')
      .insert({ templateId: newTemplate.id, title: phase.title, order: phase.order })
      .select('id')
      .single()

    if (phaseError || !newPhase) continue

    // Haal stappen op voor deze fase
    const { data: steps } = await supabaseAdmin
      .from('TemplateStep')
      .select('id, title, description, order')
      .eq('phaseId', phase.id)
      .order('order')

    for (const step of steps ?? []) {
      const { data: newStep, error: stepError } = await supabaseAdmin
        .from('TemplateStep')
        .insert({ phaseId: newPhase.id, title: step.title, description: step.description, order: step.order })
        .select('id')
        .single()

      if (stepError || !newStep) continue

      // Haal blokken op
      const { data: blocks } = await supabaseAdmin
        .from('StepBlock')
        .select('type, title, config, required, order')
        .eq('stepId', step.id)
        .order('order')

      if (blocks && blocks.length > 0) {
        await supabaseAdmin.from('StepBlock').insert(
          blocks.map(b => ({
            stepId: newStep.id,
            type: b.type,
            title: b.title,
            config: b.config,
            required: b.required,
            order: b.order,
          }))
        )
      }
    }
  }

  return NextResponse.json({ id: newTemplate.id }, { status: 201 })
}
