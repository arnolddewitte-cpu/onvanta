import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { routing } from './routing'

function isValidLocale(v: string | undefined | null): v is 'nl' | 'en' {
  return !!v && routing.locales.includes(v as 'nl' | 'en')
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!isValidLocale(locale)) {
    const cookieHeader = (await headers()).get('cookie')
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('ONVANTA_LOCALE')?.value
    // TODO: remove after debugging
    console.error('[request.ts] cookie header:', cookieHeader)
    console.error('[request.ts] ONVANTA_LOCALE:', cookieLocale)
    locale = isValidLocale(cookieLocale) ? cookieLocale : routing.defaultLocale
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
