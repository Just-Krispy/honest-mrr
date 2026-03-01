/**
 * Honest MRR — Public Verification Page
 * Anyone can verify screenshot authenticity via cryptographic signature
 */

import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { CheckCircle2, XCircle, Calendar, TrendingUp, CreditCard, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { verifySignature } from '@/lib/screenshot/generate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface VerifyPageProps {
  params: {
    id: string
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = params

  // Fetch verification record
  const { data: verification, error } = await supabase
    .from('verifications')
    .select(`
      *,
      screenshots (
        id,
        image_url,
        download_count
      ),
      stripe_connections (
        stripe_account_id,
        livemode
      )
    `)
    .eq('id', id)
    .single()

  if (error || !verification) {
    notFound()
  }

  // Verify cryptographic signature
  const isValid = verifySignature(
    verification.mrr,
    new Date(verification.created_at),
    verification.user_id,
    verification.signature
  )

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format MRR based on privacy mode
  const getMRRDisplay = () => {
    if (verification.privacy_mode === 'full') {
      return formatCurrency(verification.mrr, verification.currency)
    } else if (verification.privacy_mode === 'blurred') {
      const formatted = formatCurrency(verification.mrr, verification.currency)
      const parts = formatted.split(',')
      if (parts.length === 1) return '$XXX'
      const firstPart = parts[0].substring(0, parts[0].length - 1) + 'X'
      const blurredParts = parts.slice(1).map(() => 'XXX')
      return [firstPart, ...blurredParts].join(',')
    } else {
      // tier-only
      const mrr = verification.mrr
      if (mrr < 1000) return 'Verified $0-$1K MRR'
      if (mrr < 5000) return 'Verified $1K-$5K MRR'
      if (mrr < 10000) return 'Verified $5K-$10K MRR'
      if (mrr < 50000) return 'Verified $10K-$50K MRR'
      if (mrr < 100000) return 'Verified $50K-$100K MRR'
      if (mrr < 500000) return 'Verified $100K-$500K MRR'
      return 'Verified $500K+ MRR'
    }
  }

  const mrrDisplay = getMRRDisplay()
  const formattedDate = new Date(verification.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const screenshot = verification.screenshots?.[0]
  const stripeConnection = verification.stripe_connections

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Verification Status */}
          <div className="text-center space-y-4">
            {isValid ? (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  ✅ Verified Screenshot
                </h1>
                <p className="text-xl text-green-400">
                  This MRR screenshot is cryptographically verified and authentic
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500 mb-4">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-bold text-white">
                  ❌ Invalid Screenshot
                </h1>
                <p className="text-xl text-red-400">
                  This screenshot has been tampered with or the signature is invalid
                </p>
              </>
            )}
          </div>

          {/* MRR Display */}
          {isValid && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-5xl font-bold text-white mb-2">
                  {mrrDisplay}
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Monthly Recurring Revenue
                </CardDescription>
              </CardHeader>
              {verification.growth_percentage !== null && verification.privacy_mode === 'full' && (
                <CardContent className="text-center border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${verification.growth_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-2xl font-semibold ${verification.growth_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {verification.growth_percentage >= 0 ? '+' : ''}{verification.growth_percentage}%
                    </span>
                    <span className="text-slate-400">vs last month</span>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Verification Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Verified On
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium">{formattedDate}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Stripe Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-white font-mono text-sm">
                  {stripeConnection?.stripe_account_id.substring(0, 8)}...
                  {stripeConnection?.stripe_account_id.slice(-4)}
                </p>
                <Badge variant={stripeConnection?.livemode ? 'default' : 'secondary'} className="text-xs">
                  {stripeConnection?.livemode ? 'Live Mode' : 'Test Mode'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium text-sm">SHA-256 Signature</p>
                <p className="text-slate-400 text-xs mt-1 font-mono break-all">
                  {verification.signature.substring(0, 16)}...
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Screenshot Preview */}
          {screenshot && (
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Screenshot</CardTitle>
                <CardDescription>
                  Downloaded {screenshot.download_count || 0} times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border-2 border-slate-700">
                  <img
                    src={screenshot.image_url}
                    alt="Verified MRR Screenshot"
                    className="w-full h-auto"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1">
                    <a href={`/api/screenshots/download/${screenshot.id}`} download>
                      Download Screenshot
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a href={screenshot.image_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Original
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trust Badges */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h3 className="text-white font-semibold mb-4 text-center">How Verification Works</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-medium">Real Stripe Data</h4>
                <p className="text-slate-400">
                  MRR calculated from actual Stripe subscriptions via OAuth
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-medium">Cryptographic Proof</h4>
                <p className="text-slate-400">
                  SHA-256 signature prevents tampering and faking
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-medium">Public Verification</h4>
                <p className="text-slate-400">
                  Anyone can verify authenticity via this page
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4 pt-8">
            <h3 className="text-2xl font-bold text-white">
              Want to verify your own MRR?
            </h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Connect your Stripe account and generate cryptographically verified screenshots.
              Free tier includes 1 verified screenshot per day.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <a href="/">Get Started Free</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p>Powered by <span className="text-white font-semibold">Honest MRR</span></p>
          <p className="mt-2">Fighting fake revenue culture, one verified screenshot at a time 💯</p>
        </div>
      </div>
    </div>
  )
}
