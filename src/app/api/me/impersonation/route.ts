import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const hasFlag = !!req.cookies.get('impersonation-active')?.value
  if (!hasFlag) {
    return NextResponse.json({ impersonating: false })
  }

  const session = await getSession()
  if (!session) return NextResponse.json({ impersonating: false })

  const { data: user } = await supabaseAdmin
    .from('User')
    .select('name, email')
    .eq('id', session.id)
    .single()

  return NextResponse.json({
    impersonating: true,
    name: user?.name ?? session.email,
    email: session.email,
  })
}
