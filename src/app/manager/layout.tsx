import { unstable_noStore as noStore } from 'next/cache'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import Navigation from '@/components/navigation'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const messages = await getMessages()
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="md:pl-56">
        <Navigation role="manager" />
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
