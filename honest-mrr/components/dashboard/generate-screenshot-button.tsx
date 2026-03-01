/**
 * Honest MRR — Generate Screenshot Button Component
 * Triggers screenshot generation and displays result
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, ExternalLink, Loader2, Camera, CheckCircle } from 'lucide-react'

interface GenerateScreenshotButtonProps {
  onGenerated?: () => void
}

export function GenerateScreenshotButton({ onGenerated }: GenerateScreenshotButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    verification: {
      id: string
      mrr: number
      currency: string
      growthPercentage: number
      verificationUrl: string
    }
    screenshot: {
      id: string
      url: string
      downloadUrl: string
    }
  } | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/screenshots/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privacyMode: 'full', // TODO: Make this configurable
          customBranding: null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate screenshot')
      }

      setResult(data)
      onGenerated?.()
    } catch (err: any) {
      console.error('Error generating screenshot:', err)
      setError(err.message || 'Failed to generate screenshot')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      {!result && (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating verified screenshot...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-5 w-5" />
              Generate Verified Screenshot
            </>
          )}
        </Button>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {result && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-100">
                Screenshot Generated!
              </CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your verified MRR screenshot is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* MRR Display */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">MRR:</span>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(result.verification.mrr, result.verification.currency)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Growth:</span>
                <p className="text-2xl font-bold mt-1">
                  <span className={result.verification.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {result.verification.growthPercentage >= 0 ? '+' : ''}
                    {result.verification.growthPercentage}%
                  </span>
                </p>
              </div>
            </div>

            {/* Screenshot Preview */}
            <div className="rounded-lg overflow-hidden border-2 border-green-600">
              <img
                src={result.screenshot.url}
                alt="Verified MRR Screenshot"
                className="w-full h-auto"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                asChild
                variant="default"
                className="flex-1"
              >
                <a href={result.screenshot.downloadUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <a href={result.verification.verificationUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Verification
                </a>
              </Button>
            </div>

            {/* Generate Another */}
            <Button
              onClick={() => {
                setResult(null)
                setError(null)
              }}
              variant="ghost"
              className="w-full"
            >
              Generate Another Screenshot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
