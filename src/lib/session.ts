import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface SessionUser {
  id: string
  email: string
  role: string
  companyId: string
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('next-auth.session-token')?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const { payload } = await jwtVerify(token, secret)

    if (!payload.sub || !payload.email) return null

    return {
      id: payload.sub,
      email: payload.email as string,
      role: payload.role as string,
      companyId: payload.companyId as string,
    }
  } catch {
    return null
  }
}
