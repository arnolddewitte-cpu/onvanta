import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  // Actieve instances voor deze manager
  const { data: instances } = await supabaseAdmin
    .from('OnboardingInstance')
    .select(`
      id,
      employee:User!OnboardingInstance_employeeId_fkey(id, name, email),
      template:Template(id, name)
    `)
    .eq('managerId', session.id)
    .in('status', ['active', 'at_risk']) as {
      data: Array<{
        id: string;
        employee: { id: string; name: string; email: string };
        template: { id: string; name: string };
      }> | null
    }

  if (!instances || instances.length === 0) return NextResponse.json([])

  const instanceIds = instances.map(i => i.id)
  const templateIds = [...new Set(instances.map(i => i.template.id))]

  // Stappen met manager_approval blokken
  const { data: approvalBlocks } = await supabaseAdmin
    .from('StepBlock')
    .select('stepId, title, step:TemplateStep(id, title, phaseId, phase:TemplatePhase(id, title, templateId))')
    .eq('type', 'manager_approval') as {
      data: Array<{
        stepId: string;
        title: string;
        step: {
          id: string;
          title: string;
          phaseId: string;
          phase: { id: string; title: string; templateId: string };
        };
      }> | null
    }

  if (!approvalBlocks || approvalBlocks.length === 0) return NextResponse.json([])

  // Filter op stappen die horen bij templates van deze manager
  const relevantBlocks = approvalBlocks.filter(b =>
    templateIds.includes(b.step.phase.templateId)
  )
  if (relevantBlocks.length === 0) return NextResponse.json([])

  const relevantStepIds = relevantBlocks.map(b => b.stepId)

  // Welke stappen zijn al afgerond?
  const { data: doneProgress } = await supabaseAdmin
    .from('StepProgress')
    .select('instanceId, stepId')
    .in('instanceId', instanceIds)
    .in('stepId', relevantStepIds)
    .eq('completed', true)

  const doneSet = new Set((doneProgress ?? []).map(p => `${p.instanceId}:${p.stepId}`))

  // Bouw lijst van openstaande goedkeuringen
  const pending = []

  for (const instance of instances) {
    for (const block of relevantBlocks) {
      if (block.step.phase.templateId !== instance.template.id) continue
      const key = `${instance.id}:${block.stepId}`
      if (!doneSet.has(key)) {
        pending.push({
          instanceId: instance.id,
          stepId: block.stepId,
          stepTitle: block.step.title,
          blockTitle: block.title,
          phaseTitle: block.step.phase.title,
          employee: instance.employee,
          templateName: instance.template.name,
        })
      }
    }
  }

  return NextResponse.json(pending)
}
