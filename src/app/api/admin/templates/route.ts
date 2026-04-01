import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  // Haal templates op met geneste fases en stappen (voor tellingen)
  const { data: templates, error } = await supabaseAdmin
    .from('Template')
    .select(`
      id, name, description, published, updatedAt,
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
    phaseCount: t.phases?.length ?? 0,
    stepCount: t.phases?.reduce((acc: number, p: { steps: { id: string }[] }) => acc + (p.steps?.length ?? 0), 0) ?? 0,
  }))

  return NextResponse.json(result)
}
