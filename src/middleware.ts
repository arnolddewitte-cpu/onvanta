import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const protectedRoutes = ['/dashboard', '/onboarding', '/tasks', '/flashcards', '/manager', '/admin', '/super']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  const sessionToken = req.cookies.get('next-auth.session-token')?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const { payload } = await jwtVerify(sessionToken, secret)

    const role = payload.role as string
    
    // Role-based toegang
    if (path.startsWith('/super') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path.startsWith('/admin') && !['super_admin', 'company_admin'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (path.startsWith('/manager') && !['super_admin', 'company_admin', 'manager'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()

  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/flashcards/:path*', '/manager/:path*', '/admin/:path*', '/super/:path*'],
}