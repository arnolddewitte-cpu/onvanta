import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Navigation from '@/components/navigation'

export default async function HelpLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const role = session.role as 'employee' | 'manager' | 'company_admin' | 'super_admin'

  return (
    <div className="md:pl-56">
      <Navigation role={role} />
      {children}
    </div>
  )
}
