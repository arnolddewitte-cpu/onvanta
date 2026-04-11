import { unstable_noStore as noStore } from 'next/cache'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import Navigation from '@/components/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const locale = await getLocale()
  const messages = await getMessages({ locale })
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="md:pl-56">
        <Navigation role="employee" />
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
