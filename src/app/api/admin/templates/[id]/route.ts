import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: template, error: templateError } = await supabaseAdmin
    .from('Template')
    .select('id, name, description, published')
    .eq('id', id)
    .single()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template niet gevonden' }, { status: 404 })
  }

  const { data: phases, error: phasesError } = await supabaseAdmin
    .from('TemplatePhase')
    .select('id, title, order')
    .eq('templateId', id)
    .order('order')

  if (phasesError) {
    return NextResponse.json({ error: 'Fout bij ophalen fases' }, { status: 500 })
  }

  const phaseIds = (phases ?? []).map(p => p.id)

  const { data: steps, error: stepsError } = phaseIds.length > 0
    ? await supabaseAdmin
        .from('TemplateStep')
        .select('id, phaseId, title, order')
        .in('phaseId', phaseIds)
        .order('order')
    : { data: [], error: null }

  if (stepsError) {
    return NextResponse.json({ error: 'Fout bij ophalen stappen' }, { status: 500 })
  }

  const stepIds = (steps ?? []).map(s => s.id)

  const { data: blocks } = stepIds.length > 0
    ? await supabaseAdmin
        .from('StepBlock')
        .select('id, stepId, type, title, order')
        .in('stepId', stepIds)
        .order('order')
    : { data: [] }

  const phasesWithSteps = (phases ?? []).map(phase => ({
    ...phase,
    steps: (steps ?? [])
      .filter(s => s.phaseId === phase.id)
      .map(s => ({
        ...s,
        blocks: (blocks ?? []).filter(b => b.stepId === s.id),
      })),
  }))

  return NextResponse.json({ ...template, phases: phasesWithSteps })
}
