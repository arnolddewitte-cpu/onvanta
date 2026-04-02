import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId is verplicht' }, { status: 400 })
  }

  const { data: user } = await supabaseAdmin
    .from('User')
    .select('id, email, role, companyId, name')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
  }

  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

  const userToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(secret)

  const superAdminToken = req.cookies.get('next-auth.session-token')?.value

  const redirectMap: Record<string, string> = {
    super_admin: '/super',
    company_admin: '/admin',
    manager: '/manager',
    employee: '/dashboard',
  }
  const redirect = redirectMap[user.role] ?? '/dashboard'

  await logAudit('impersonation_start', session.id, user.companyId, {
    targetUserId: user.id,
    targetEmail: user.email,
    superAdminId: session.id,
  })

  // Return JSON (not redirect) so fetch() can apply the Set-Cookie headers
  const response = NextResponse.json({ redirect })

  if (superAdminToken) {
    response.cookies.set('super-admin-token', superAdminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4,
    })
  }

  response.cookies.set('next-auth.session-token', userToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  })

  // Non-httpOnly flag so the banner can detect impersonation client-side
  response.cookies.set('impersonation-active', '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4,
  })

  return response
}
