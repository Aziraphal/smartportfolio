import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  team_monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  team_yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID!,
}

export const PLAN_TO_PRICE_ID = {
  'pro-monthly': STRIPE_PRICE_IDS.pro_monthly,
  'pro-yearly': STRIPE_PRICE_IDS.pro_yearly,
  'team-monthly': STRIPE_PRICE_IDS.team_monthly,
  'team-yearly': STRIPE_PRICE_IDS.team_yearly,
}

export type StripePlan = keyof typeof PLAN_TO_PRICE_ID