import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  const { phaseId } = await params
  const { title, order } = await req.json()

  const { data: step, error } = await supabaseAdmin
    .from('TemplateStep')
    .insert({ phaseId, title: title ?? 'Nieuwe stap', order: order ?? 0 })
    .select()
    .single()

  if (error || !step) {
    console.error('Step insert error:', error)
    return NextResponse.json(
      { error: 'Kon stap niet aanmaken', detail: error?.message },
      { status: 500 }
    )
  }

  return NextResponse.json(step)
}
