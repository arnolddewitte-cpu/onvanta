import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const session = await getSession()
  if (!session || !['company_admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { data: company } = await supabaseAdmin
    .from('Company')
    .select('stripeCustomerId')
    .eq('id', session.companyId)
    .single()

  if (!company?.stripeCustomerId) {
    return NextResponse.json({ error: 'Geen actief abonnement gevonden' }, { status: 404 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${baseUrl}/admin/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
