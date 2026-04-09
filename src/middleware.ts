import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all paths except: API routes, authenticated app routes, Next.js internals, and static files
  matcher: [
    '/((?!api|admin|dashboard|manager|onboarding|login|signup|flashcards|tasks|super|_next|_vercel|.*\\..*).*)',
  ],
}
