/**
 * Honest MRR — MRR Calculation Utilities
 * Fetch real revenue data from Stripe and calculate Monthly Recurring Revenue
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface MRRMetrics {
  mrr: number // Monthly Recurring Revenue in dollars
  currency: string
  activeSubscriptions: number
  churnedSubscriptions: number
  newSubscriptions: number
  previousMrr?: number
  growthPercentage?: number
}

/**
 * Calculate MRR from Stripe account
 * @param stripeAccountId Connected Stripe account ID
 * @param accessToken OAuth access token for connected account
 * @returns MRR metrics
 */
export async function calculateMRR(
  stripeAccountId: string,
  accessToken: string
): Promise<MRRMetrics> {
  // Fetch all active subscriptions
  const subscriptions = await stripe.subscriptions.list(
    {
      status: 'active',
      limit: 100, // Paginate if needed
    },
    {
      stripeAccount: stripeAccountId, // Use connected account
    }
  )

  let mrr = 0
  let currency = 'usd'
  const activeSubscriptions = subscriptions.data.length

  // Calculate MRR from subscriptions
  for (const sub of subscriptions.data) {
    const item = sub.items.data[0]
    if (!item || !item.price) continue

    const amount = item.price.unit_amount! / 100 // Convert cents to dollars
    const interval = item.price.recurring?.interval
    currency = item.price.currency

    // Normalize to monthly
    if (interval === 'year') {
      mrr += amount / 12
    } else if (interval === 'month') {
      mrr += amount
    } else if (interval === 'week') {
      mrr += amount * 4.33 // Average weeks per month
    } else if (interval === 'day') {
      mrr += amount * 30 // Average days per month
    }
  }

  // Fetch churned subscriptions (canceled in last 30 days)
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60

  const churnedSubs = await stripe.subscriptions.list(
    {
      status: 'canceled',
      created: { gte: thirtyDaysAgo },
      limit: 100,
    },
    {
      stripeAccount: stripeAccountId,
    }
  )

  const churnedSubscriptions = churnedSubs.data.length

  // Fetch new subscriptions (created in last 30 days)
  const newSubs = await stripe.subscriptions.list(
    {
      status: 'active',
      created: { gte: thirtyDaysAgo },
      limit: 100,
    },
    {
      stripeAccount: stripeAccountId,
    }
  )

  const newSubscriptions = newSubs.data.length

  return {
    mrr: Math.round(mrr * 100) / 100, // Round to 2 decimals
    currency,
    activeSubscriptions,
    churnedSubscriptions,
    newSubscriptions,
  }
}

/**
 * Calculate MRR growth percentage
 */
export function calculateGrowth(currentMrr: number, previousMrr: number): number {
  if (!previousMrr || previousMrr === 0) return 0
  return Math.round(((currentMrr - previousMrr) / previousMrr) * 100 * 100) / 100
}

/**
 * Detect fake MRR patterns
 * Returns array of red flags if any detected
 */
export async function detectFakeMRR(
  stripeAccountId: string,
  accessToken: string
): Promise<string[]> {
  const redFlags: string[] = []

  // Check if using test mode (should use live mode for verification)
  const account = await stripe.accounts.retrieve(stripeAccountId)
  
  // Note: In production, you'd check account.charges_enabled and other flags
  
  // Fetch recent charges to check for one-time payments disguised as MRR
  const charges = await stripe.charges.list(
    {
      limit: 100,
    },
    {
      stripeAccount: stripeAccountId,
    }
  )

  // Check for patterns
  const oneTimeCharges = charges.data.filter(c => !c.invoice)
  if (oneTimeCharges.length > 0) {
    redFlags.push('One-time charges detected (may be lifetime deals counted as MRR)')
  }

  // Check for high refund rate
  const refunds = await stripe.refunds.list(
    {
      limit: 100,
    },
    {
      stripeAccount: stripeAccountId,
    }
  )

  if (refunds.data.length > charges.data.length * 0.2) {
    redFlags.push('High refund rate (>20% of charges refunded)')
  }

  return redFlags
}

/**
 * Verify Stripe account is in live mode (not test mode)
 */
export async function verifyLiveMode(stripeAccountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId)
    // In live mode, account should have charges_enabled = true
    return account.charges_enabled || false
  } catch (error) {
    console.error('Error verifying Stripe account:', error)
    return false
  }
}
