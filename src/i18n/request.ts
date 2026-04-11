import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { routing } from './routing'

function isValidLocale(v: string | undefined | null): v is 'nl' | 'en' {
  return !!v && routing.locales.includes(v as 'nl' | 'en')
}

async function getCompanyLocale(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('next-auth.session-token')?.value
    if (!token) return null

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const companyId = payload.companyId as string | undefined
    if (!companyId) return null

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) } },
    )
    const { data } = await supabase
      .from('Company')
      .select('locale')
      .eq('id', companyId)
      .single()

    return data?.locale ?? null
  } catch {
    return null
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // For app routes (no URL locale segment), resolve priority:
  // 1. Company.locale from DB (for logged-in users)
  // 2. Cookie
  // 3. Default
  if (!isValidLocale(locale)) {
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('ONVANTA_LOCALE')?.value

    const companyLocale = await getCompanyLocale()

    if (isValidLocale(companyLocale)) {
      locale = companyLocale
    } else if (isValidLocale(cookieLocale)) {
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
