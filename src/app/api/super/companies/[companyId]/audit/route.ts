import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { companyId } = await params

  const { data, error } = await supabaseAdmin
    .from('AuditLog')
    .select('id, action, details, createdAt, user:User(name, email)')
    .eq('companyId', companyId)
    .order('createdAt', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: 'Kon logs niet laden' }, { status: 500 })

  return NextResponse.json(
    (data ?? []).map(e => {
      const u = e.user as unknown as { name: string; email: string } | null
      return {
        id: e.id,
        action: e.action,
        details: e.details,
        createdAt: e.createdAt,
        userName: u?.name ?? '—',
        userEmail: u?.email ?? '',
      }
    })
  )
}
