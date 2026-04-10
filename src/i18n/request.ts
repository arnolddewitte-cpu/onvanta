import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // For app routes (no URL locale segment), fall back to cookie then default
  if (!locale || !routing.locales.includes(locale as 'nl' | 'en')) {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('ONVANTA_LOCALE')?.value
    if (cookieLocale && routing.locales.includes(cookieLocale as 'nl' | 'en')) {
      locale = cookieLocale
    } else {
      locale = routing.defaultLocale
    }
  }

  const [common, home, pricing, about, contact, privacy, terms, app] = await Promise.all([
    import(`../../locales/${locale}/common.json`),
    import(`../../locales/${locale}/home.json`),
    import(`../../locales/${locale}/pricing.json`),
    import(`../../locales/${locale}/about.json`),
    import(`../../locales/${locale}/contact.json`),
    import(`../../locales/${locale}/privacy.json`),
    import(`../../locales/${locale}/terms.json`),
    import(`../../locales/${locale}/app.json`),
  ])

  return {
    locale,
    messages: {
      common: common.default,
      home: home.default,
      pricing: pricing.default,
      about: about.default,
      contact: contact.default,
      privacy: privacy.default,
      terms: terms.default,
      app: app.default,
    },
  }
})
