import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { instanceId } = await params
  const { stepId, approved } = await req.json()

  // Controleer dat manager deze instance beheert
  const { data: instance } = await supabaseAdmin
    .from('OnboardingInstance')
    .select('id, templateId')
    .eq('id', instanceId)
    .eq('managerId', session.id)
    .single()

  if (!instance) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  if (approved) {
    // Markeer stap als voltooid
    const { error } = await supabaseAdmin
      .from('StepProgress')
      .upsert(
        { instanceId, stepId, completed: true, completedAt: new Date().toISOString() },
        { onConflict: 'instanceId,stepId' }
      )
    if (error) return NextResponse.json({ error: 'Kon niet opslaan' }, { status: 500 })

    // Herbereken progressPct
    const { data: allSteps } = await supabaseAdmin
      .from('TemplateStep')
      .select('id, phase:TemplatePhase!inner(templateId)')
      .eq('phase.templateId', instance.templateId)

    const { data: done } = await supabaseAdmin
      .from('StepProgress')
      .select('stepId')
      .eq('instanceId', instanceId)
      .eq('completed', true)

    const progressPct = (allSteps?.length ?? 0) > 0
      ? Math.round(((done?.length ?? 0) / (allSteps?.length ?? 1)) * 100)
      : 0

    await supabaseAdmin
      .from('OnboardingInstance')
      .update({ progressPct })
      .eq('id', instanceId)
  }

  return NextResponse.json({ success: true })
}
