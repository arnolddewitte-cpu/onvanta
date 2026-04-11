import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['nl', 'en'],
  defaultLocale: 'nl',
  localePrefix: 'as-needed', // nl: no prefix (/), en: /en prefix
  localeDetection: false,    // URL prefix is the only routing signal — no NEXT_LOCALE cookie redirect
})

// Locale-aware navigation helpers — import useRouter/usePathname/Link from here
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
