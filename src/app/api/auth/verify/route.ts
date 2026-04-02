import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SignJWT } from 'jose'
import { logAudit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing-token', req.url))
  }

  // 1. Zoek token op
  const { data: magicToken } = await supabaseAdmin
    .from('MagicLinkToken')
    .select('*, User(*)')
    .eq('token', token)
    .eq('used', false)
    .single()

  if (!magicToken) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  }

  // 2. Check of token nog geldig is
  if (new Date(magicToken.expires) < new Date()) {
    return NextResponse.redirect(new URL('/login?error=expired-token', req.url))
  }

  // 3. Markeer token als gebruikt
  await supabaseAdmin
    .from('MagicLinkToken')
    .update({ used: true })
    .eq('token', token)

  // 4. Maak sessie aan via jose
  const user = magicToken.User
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

  const sessionToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)

  // 4b. Log login
  await logAudit('login', user.id, user.companyId, { email: user.email, role: user.role })

  // 5. Redirect op basis van rol
  const redirectMap: Record<string, string> = {
    super_admin: '/super',
    company_admin: '/admin',
    manager: '/manager',
    employee: '/dashboard',
  }
  const redirectTo = redirectMap[user.role] ?? '/dashboard'

  const response = NextResponse.redirect(new URL(redirectTo, req.url))
  response.cookies.set('next-auth.session-token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}