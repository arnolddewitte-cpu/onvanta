import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export const PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
  starter_yearly:  process.env.STRIPE_PRICE_STARTER_YEARLY!,
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY!,
  pro_yearly:      process.env.STRIPE_PRICE_PRO_YEARLY!,
} as const

export type PriceKey = keyof typeof PRICE_IDS
