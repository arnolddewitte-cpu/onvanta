import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const PRICE_METERED = process.env.STRIPE_PRICE_METERED!
export const METER_ID = process.env.STRIPE_METER_ID!
