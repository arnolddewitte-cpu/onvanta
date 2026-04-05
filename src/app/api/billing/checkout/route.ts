import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe, PRICE_METERED } from '@/lib/stripe'

export async function POST(_req: NextRequest) {
  try {
    if (!PRICE_METERED) {
      console.error('[billing/checkout] STRIPE_PRICE_METERED env var is not set')
      return NextResponse.json({ error: 'Billing configuratie ontbreekt (STRIPE_PRICE_METERED)' }, { status: 500 })
    }

    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }
    if (!['company_admin', 'super_admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Geen toegang — alleen admins kunnen een abonnement starten' }, { status: 403 })
    }
    if (!session.companyId) {
      return NextResponse.json({ error: 'Geen bedrijf gekoppeld aan dit account' }, { status: 400 })
    }

    const { data: company, error: companyErr } = await supabaseAdmin
      .from('Company')
      .select('id, name, stripeCustomerId')
      .eq('id', session.companyId)
      .single()

    if (companyErr || !company) {
      console.error('[billing/checkout] company lookup failed:', companyErr)
      return NextResponse.json({ error: 'Bedrijf niet gevonden' }, { status: 404 })
    }

    // Maak Stripe customer aan als die er nog niet is
    let customerId = company.stripeCustomerId
    if (!customerId) {
      const { data: adminUser } = await supabaseAdmin
        .from('User')
        .select('email, name')
        .eq('companyId', session.companyId)
        .eq('role', 'company_admin')
        .maybeSingle()

      const customer = await stripe.customers.create({
        name: company.name,
        email: adminUser?.email,
        metadata: { companyId: session.companyId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('Company')
        .update({ stripeCustomerId: customerId })
        .eq('id', session.companyId)
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? `https://${process.env.VERCEL_URL}`

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_METERED }],
      success_url: `${baseUrl}/admin/settings?success=true`,
      cancel_url: `${baseUrl}/admin/settings`,
      metadata: { companyId: session.companyId },
      subscription_data: {
        metadata: { companyId: session.companyId },
        trial_period_days: 14,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: unknown) {
    const stripeMsg = (err as { message?: string })?.message ?? String(err)
    console.error('[billing/checkout] Stripe error:', stripeMsg)
    return NextResponse.json({ error: `Kon checkout niet starten: ${stripeMsg}` }, { status: 500 })
  }
}
