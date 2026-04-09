import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'as-needed', // nl: no prefix (/), en: /en prefix
})

// Locale-aware navigation helpers — import useRouter/usePathname/Link from here
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
