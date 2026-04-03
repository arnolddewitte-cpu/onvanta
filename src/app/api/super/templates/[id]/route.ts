import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH: toggle isGlobal op een template
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const { isGlobal } = await req.json()

  if (typeof isGlobal !== 'boolean') {
    return NextResponse.json({ error: 'isGlobal moet een boolean zijn' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('Template')
    .update({ isGlobal })
    .eq('id', id)

  if (error) {
    console.error('Toggle isGlobal error:', error)
    return NextResponse.json({ error: 'Kon template niet bijwerken' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
