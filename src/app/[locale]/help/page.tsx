import { getSession } from '@/lib/session'
import HelpClient from './HelpClient'

export default async function HelpPage() {
  const session = await getSession()
  // Public visitors see all articles (company_admin level)
  const role = (session?.role ?? 'company_admin') as 'employee' | 'manager' | 'company_admin' | 'super_admin'
  return <HelpClient role={role} />
}
