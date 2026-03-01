/**
 * Honest MRR — Dashboard Page
 * Main user interface: connect Stripe, view MRR, generate screenshots
 */

import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getStripeConnection } from '@/lib/stripe/oauth'
import { ConnectStripeButton } from '@/components/dashboard/connect-stripe-button'
import { StripeConnectedCard } from '@/components/dashboard/stripe-connected-card'
import { GenerateScreenshotButton } from '@/components/dashboard/generate-screenshot-button'
import { MRRDisplayCard } from '@/components/dashboard/mrr-display-card'
import { ScreenshotHistoryTable } from '@/components/dashboard/screenshot-history-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get Stripe connection status
  const stripeConnection = await getStripeConnection(user.id)

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400 mt-1">
                Manage your verified MRR screenshots
              </p>
            </div>
            <div className="flex items-center gap-4">
              {subscription && (
                <div className="text-right">
                  <p className="text-sm text-slate-400">Plan</p>
                  <p className="text-white font-semibold capitalize">
                    {subscription.plan_name}
                  </p>
                </div>
              )}
              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {!stripeConnection ? (
          /* Not Connected State */
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">
                  Welcome to Honest MRR! 👋
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Connect your Stripe account to start generating verified revenue screenshots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectStripeButton />
              </CardContent>
            </Card>

            {/* Features Preview */}
            <div className="mt-8 grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-white font-medium">Cryptographic Proof</h4>
                <p className="text-slate-400">
                  SHA-256 signatures prevent tampering and faking
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium">Read-Only Access</h4>
                <p className="text-slate-400">
                  We can't charge cards or modify your Stripe data
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium">Public Verification</h4>
                <p className="text-slate-400">
                  Anyone can verify authenticity via QR code
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Connected State */
          <>
            {/* Connection Status */}
            <StripeConnectedCard
              stripeAccountId={stripeConnection.stripe_account_id}
              livemode={stripeConnection.livemode}
              connectedAt={stripeConnection.connected_at}
              onDisconnect={async () => {
                'use server'
                // Handled client-side via fetch to /api/stripe/disconnect
              }}
            />

            {/* MRR Display */}
            <MRRDisplayCard userId={user.id} />

            {/* Generate Screenshot */}
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Generate Screenshot</CardTitle>
                <CardDescription>
                  {subscription?.plan_name === 'free'
                    ? `Free tier: ${subscription.screenshots_per_day} screenshot per day`
                    : 'Unlimited screenshots (Pro/Premium plan)'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerateScreenshotButton
                  onGenerated={() => {
                    // Refresh page to show new screenshot in history
                  }}
                />
              </CardContent>
            </Card>

            {/* Screenshot History */}
            <ScreenshotHistoryTable userId={user.id} />
          </>
        )}
      </div>
    </div>
  )
}
