import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { stripe, METER_ID } from '@/lib/stripe'

// Beveiligd met een geheime cron token zodat alleen Vercel Cron dit mag aanroepen
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // lokaal zonder secret: toestaan
  return auth === `Bearer ${cronSecret}`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Ongeautoriseerd' }, { status: 401 })
  }

  // Haal alle actieve bedrijven op met een Stripe customer
  const { data: companies } = await supabaseAdmin
    .from('Company')
    .select('id, name, stripeCustomerId')
    .eq('status', 'active')
    .not('stripeCustomerId', 'is', null)

  if (!companies?.length) {
    return NextResponse.json({ reported: 0, message: 'Geen actieve bedrijven met Stripe customer' })
  }

  const results: { companyId: string; name: string; activeOnboardees: number; reported: boolean }[] = []

  for (const company of companies) {
    // Tel actieve OnboardingInstances voor dit bedrijf
    const { count } = await supabaseAdmin
      .from('OnboardingInstance')
      .select('id', { count: 'exact', head: true })
      .eq('companyId', company.id)
      .eq('status', 'active')

    const activeOnboardees = count ?? 0

    try {
      // Rapporteer gebruik aan Stripe via billing meter event
      await stripe.billing.meterEvents.create({
        event_name: 'active_onboardees',
        payload: {
          stripe_customer_id: company.stripeCustomerId!,
          value: String(activeOnboardees),
        },
      })
      results.push({ companyId: company.id, name: company.name, activeOnboardees, reported: true })
    } catch (err) {
      console.error(`[report-usage] Fout voor ${company.name}:`, err)
      results.push({ companyId: company.id, name: company.name, activeOnboardees, reported: false })
    }
  }

  console.log('[report-usage] Voltooid:', results)
  return NextResponse.json({ reported: results.filter(r => r.reported).length, total: results.length, results })
}

// GET voor handmatig testen
export async function GET(req: NextRequest) {
  return POST(req)
}
