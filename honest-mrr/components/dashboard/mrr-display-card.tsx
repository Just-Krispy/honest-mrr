/**
 * Honest MRR — MRR Display Card Component
 * Shows current MRR with growth trend
 */

import { createClient } from '@supabase/supabase-js'
import { getAccessToken } from '@/lib/stripe/oauth'
import { calculateMRR, calculateGrowth } from '@/lib/stripe/calculate-mrr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface MRRDisplayCardProps {
  userId: string
}

export async function MRRDisplayCard({ userId }: MRRDisplayCardProps) {
  try {
    // Get Stripe connection
    const { data: connection } = await supabase
      .from('stripe_connections')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!connection) {
      return null
    }

    // Get access token
    const accessToken = await getAccessToken(userId)
    
    if (!accessToken) {
      return (
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Current MRR</CardTitle>
            <CardDescription className="text-red-400">
              Failed to fetch MRR data. Please reconnect Stripe.
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }

    // Calculate current MRR
    const mrrMetrics = await calculateMRR(connection.stripe_account_id, accessToken)

    // Get previous MRR for growth calculation
    const { data: previousVerification } = await supabase
      .from('verifications')
      .select('mrr')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const previousMrr = previousVerification?.mrr || 0
    const growthPercentage = calculateGrowth(mrrMetrics.mrr, previousMrr)

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    return (
      <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Current MRR
          </CardTitle>
          <CardDescription className="text-purple-200">
            Live data from your Stripe account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* MRR Amount */}
          <div className="text-center">
            <p className="text-5xl font-bold text-white">
              {formatCurrency(mrrMetrics.mrr, mrrMetrics.currency)}
            </p>
          </div>

          {/* Growth */}
          {previousMrr > 0 && (
            <div className="flex items-center justify-center gap-2">
              {growthPercentage >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-2xl font-semibold ${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </span>
              <span className="text-purple-200">vs last verification</span>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-700/50">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {mrrMetrics.activeSubscriptions}
              </p>
              <p className="text-sm text-purple-200 mt-1">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                +{mrrMetrics.newSubscriptions}
              </p>
              <p className="text-sm text-purple-200 mt-1">New</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">
                -{mrrMetrics.churnedSubscriptions}
              </p>
              <p className="text-sm text-purple-200 mt-1">Churned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error fetching MRR:', error)
    return (
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Current MRR</CardTitle>
          <CardDescription className="text-red-400">
            Error fetching MRR data. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
}
