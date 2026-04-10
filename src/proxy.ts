import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// App routes that should NOT go through locale routing
const APP_PREFIXES = [
  '/api', '/admin', '/dashboard', '/manager', '/onboarding',
  '/login', '/signup', '/flashcards', '/tasks', '/super',
  '/_next', '/_vercel',
]

const protectedRoutes = ['/dashboard', '/onboarding', '/tasks', '/flashcards', '/manager', '/admin', '/super']

function isAppPath(path: string) {
  return APP_PREFIXES.some(p => path === p || path.startsWith(p + '/'))
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // /en/<app-path> → redirect to /<app-path> (app routes never have a locale prefix)
  if (path.startsWith('/en/')) {
    const stripped = path.slice(3) // e.g. /en/login → /login
    if (isAppPath(stripped)) {
      return NextResponse.redirect(new URL(stripped + req.nextUrl.search, req.url))
    }
  }

  // Marketing pages (including /en/* variants) → next-intl locale routing
  if (!isAppPath(path)) {
    return intlMiddleware(req)
  }

  // Protected app routes → auth check
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
    // Managers mogen onboarding starten via /admin/onboardings/new
    const managerAllowedAdminPaths = ['/admin/onboardings/new']
    const isManagerAllowedAdminPath = managerAllowedAdminPaths.some(p => path.startsWith(p))
    if (path.startsWith('/admin') && !['super_admin', 'company_admin'].includes(role)) {
      if (role === 'manager' && isManagerAllowedAdminPath) {
        // OK — manager mag deze specifieke admin route gebruiken
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
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
  matcher: [
    // Everything except Next.js internals and static files
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
}
