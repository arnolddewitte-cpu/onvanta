import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const superAdminToken = req.cookies.get('super-admin-token')?.value

  const response = NextResponse.redirect(new URL('/super', req.url))

  if (superAdminToken) {
    response.cookies.set('next-auth.session-token', superAdminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  response.cookies.delete('super-admin-token')
  response.cookies.delete('impersonation-active')

  return response
}
