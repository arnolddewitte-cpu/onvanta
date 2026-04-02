import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

let _stripe: Stripe | null = null
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return _stripe
}

// Map Stripe subscription status -> Company status/plan
function resolveCompanyStatus(stripeStatus: Stripe.Subscription['status']): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'paused'
    case 'canceled':
    case 'incomplete_expired':
      return 'cancelled'
    default:
      return 'active'
  }
}

function resolvePlan(priceId: string): string {
  const starterPrices = [
    process.env.STRIPE_PRICE_STARTER_MONTHLY,
    process.env.STRIPE_PRICE_STARTER_YEARLY,
  ]
  const proPrices = [
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_YEARLY,
  ]
  if (starterPrices.includes(priceId)) return 'starter'
  if (proPrices.includes(priceId)) return 'pro'
  return 'starter'
}

async function getCompanyByCustomerId(customerId: string) {
  const { data } = await supabaseAdmin
    .from('Company')
    .select('id')
    .eq('stripeCustomerId', customerId)
    .single()
  return data
}

async function updateCompany(customerId: string, fields: Record<string, unknown>) {
  const company = await getCompanyByCustomerId(customerId)
  if (!company) {
    console.warn(`No company found for Stripe customer ${customerId}`)
    return
  }
  const { error } = await supabaseAdmin
    .from('Company')
    .update(fields)
    .eq('id', company.id)
  if (error) console.error('Company update error:', error)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id ?? ''
  await updateCompany(customerId, {
    status: resolveCompanyStatus(subscription.status),
    plan: resolvePlan(priceId),
    stripeSubscriptionId: subscription.id,
    trialEndsAt: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id ?? ''
  await updateCompany(customerId, {
    status: resolveCompanyStatus(subscription.status),
    plan: resolvePlan(priceId),
    trialEndsAt: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  await updateCompany(customerId, {
    status: 'cancelled',
    stripeSubscriptionId: null,
  })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  await updateCompany(customerId, { status: 'active' })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  await updateCompany(customerId, { status: 'paused' })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        // Onbekend event — negeren
        break
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
