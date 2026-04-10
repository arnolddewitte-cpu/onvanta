import { getSession } from '@/lib/session'
import HelpClient from './HelpClient'

export default async function HelpPage() {
  const session = await getSession()
  return <HelpClient role={session!.role as 'employee' | 'manager' | 'company_admin' | 'super_admin'} />
}
