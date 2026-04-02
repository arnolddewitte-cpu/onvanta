import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

const DEFAULT_FLAGS = ['ai_templates', 'flashcards', 'manager_approval']

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params

  const { data } = await supabaseAdmin
    .from('FeatureFlag')
    .select('flag, enabled')
    .eq('companyId', companyId)

  const existing = Object.fromEntries((data ?? []).map(f => [f.flag, f.enabled]))

  return NextResponse.json(
    DEFAULT_FLAGS.map(flag => ({ flag, enabled: existing[flag] ?? false }))
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params
  const { flag, enabled } = await req.json()

  if (!DEFAULT_FLAGS.includes(flag) || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Ongeldige flag of waarde' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('FeatureFlag')
    .upsert(
      { companyId, flag, enabled, updatedAt: new Date().toISOString() },
      { onConflict: 'companyId,flag' }
    )

  if (error) return NextResponse.json({ error: 'Kon flag niet opslaan' }, { status: 500 })

  return NextResponse.json({ success: true })
}
