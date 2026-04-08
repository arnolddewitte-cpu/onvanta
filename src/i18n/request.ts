import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'nl' | 'en')) {
    locale = routing.defaultLocale
  }

  const [common, home, pricing, about, contact, privacy, terms] = await Promise.all([
    import(`../../locales/${locale}/common.json`),
    import(`../../locales/${locale}/home.json`),
    import(`../../locales/${locale}/pricing.json`),
    import(`../../locales/${locale}/about.json`),
    import(`../../locales/${locale}/contact.json`),
    import(`../../locales/${locale}/privacy.json`),
    import(`../../locales/${locale}/terms.json`),
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
    },
  }
})
