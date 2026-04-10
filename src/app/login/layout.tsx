import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
