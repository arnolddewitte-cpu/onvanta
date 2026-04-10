import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import Navigation from '@/components/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="md:pl-56">
        <Navigation role="company_admin" />
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
