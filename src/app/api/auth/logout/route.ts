import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('next-auth.session-token')
  response.cookies.delete('super-admin-token')
  response.cookies.delete('impersonation-active')
  return response
}
