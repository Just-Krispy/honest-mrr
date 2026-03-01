/**
 * Honest MRR — Screenshot History Table Component
 * Shows recent verified screenshots with download/verify links
 */

import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ExternalLink, Eye } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScreenshotHistoryTableProps {
  userId: string
}

export async function ScreenshotHistoryTable({ userId }: ScreenshotHistoryTableProps) {
  // Fetch recent screenshots
  const { data: screenshots, error } = await supabase
    .from('screenshots')
    .select(`
      id,
      image_url,
      download_count,
      created_at,
      verifications (
        id,
        mrr,
        currency,
        growth_percentage,
        privacy_mode,
        verification_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error || !screenshots || screenshots.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Screenshot History</CardTitle>
          <CardDescription>
            Your recent verified screenshots will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-slate-400">
            No screenshots yet. Generate your first verified screenshot above!
          </p>
        </CardContent>
      </Card>
    )
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Screenshot History</CardTitle>
        <CardDescription>
          Recent verified screenshots ({screenshots.length} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {screenshots.map((screenshot) => {
            const verification = screenshot.verifications?.[0]
            if (!verification) return null

            return (
              <div
                key={screenshot.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={screenshot.image_url}
                    alt="Screenshot thumbnail"
                    className="w-24 h-14 object-cover rounded border border-slate-600"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold">
                      {formatCurrency(verification.mrr, verification.currency)}
                    </p>
                    {verification.growth_percentage !== null && (
                      <Badge
                        variant={verification.growth_percentage >= 0 ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {verification.growth_percentage >= 0 ? '+' : ''}
                        {verification.growth_percentage}%
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs capitalize">
                      {verification.privacy_mode}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">
                    {formatDate(screenshot.created_at)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {screenshot.download_count || 0} downloads
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <a href={`/api/screenshots/download/${screenshot.id}`} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <a href={screenshot.image_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <a href={verification.verification_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Verify
                    </a>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
