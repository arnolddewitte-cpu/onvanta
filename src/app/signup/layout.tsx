import { unstable_noStore as noStore } from 'next/cache'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const locale = await getLocale()
  const messages = await getMessages({ locale })
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
