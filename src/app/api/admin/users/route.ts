import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data: users, error } = await supabaseAdmin
    .from('User')
    .select('id, name, email, role')
    .in('role', ['manager', 'company_admin'])
    .order('name')

  if (error) {
    return NextResponse.json({ error: 'Kon gebruikers niet ophalen' }, { status: 500 })
  }

  return NextResponse.json(users ?? [])
}
