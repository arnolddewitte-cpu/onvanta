import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match marketing pages only — leave app routes untouched
  matcher: [
    '/',
    '/(about|pricing|contact|privacy|terms)',
    '/en',
    '/en/:path*',
  ],
}
