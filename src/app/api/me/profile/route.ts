import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data: user } = await supabaseAdmin
    .from('User')
    .select('name')
    .eq('id', session.id)
    .single()

  return NextResponse.json({
    id: session.id,
    email: session.email,
    role: session.role,
    companyId: session.companyId,
    name: user?.name ?? session.email,
  })
}
