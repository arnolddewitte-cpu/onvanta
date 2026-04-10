import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'
import { routing } from './routing'

function isValidLocale(v: string | undefined | null): v is 'nl' | 'en' {
  return !!v && routing.locales.includes(v as 'nl' | 'en')
}

async function getDbLocales(): Promise<{ userLocale: string | null; companyLocale: string | null }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('next-auth.session-token')?.value
    if (!token) return { userLocale: null, companyLocale: null }

    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.sub as string | undefined
    const companyId = payload.companyId as string | undefined
    if (!userId && !companyId) return { userLocale: null, companyLocale: null }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const [userResult, companyResult] = await Promise.all([
      userId ? supabase.from('User').select('locale').eq('id', userId).single() : Promise.resolve({ data: null }),
      companyId ? supabase.from('Company').select('locale').eq('id', companyId).single() : Promise.resolve({ data: null }),
    ])

    return {
      userLocale: (userResult.data as { locale?: string } | null)?.locale ?? null,
      companyLocale: (companyResult.data as { locale?: string } | null)?.locale ?? null,
    }
  } catch {
    return { userLocale: null, companyLocale: null }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (isValidLocale(locale)) {
    // URL locale segment always wins — /help = nl, /en/help = en, no exceptions.
  } else {
    // App routes without a URL locale segment: User.locale > Company.locale > cookie > default
    const cookieStore = await cookies()
    const cookieLocale = cookieStore.get('ONVANTA_LOCALE')?.value

    const { userLocale, companyLocale } = await getDbLocales()

    if (isValidLocale(userLocale)) {
      locale = userLocale
    } else if (isValidLocale(companyLocale)) {
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
