/**
 * Honest MRR — Stripe Connected Card Component
 * Shows connected Stripe account info + disconnect option
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Check, Unplug } from 'lucide-react'

interface StripeConnectedCardProps {
  stripeAccountId: string
  livemode: boolean
  connectedAt: string
  onDisconnect: () => Promise<void>
}

export function StripeConnectedCard({
  stripeAccountId,
  livemode,
  connectedAt,
  onDisconnect,
}: StripeConnectedCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await onDisconnect()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const formattedDate = new Date(connectedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Stripe Connected
            </CardTitle>
            <CardDescription>
              Your Stripe account is connected and ready to generate verified screenshots
            </CardDescription>
          </div>
          <Badge variant={livemode ? 'default' : 'secondary'}>
            {livemode ? 'Live Mode' : 'Test Mode'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Account ID:</span>
            <p className="font-mono mt-1">
              {stripeAccountId.substring(0, 12)}...{stripeAccountId.slice(-4)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Connected:</span>
            <p className="mt-1">{formattedDate}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Unplug className="w-4 h-4 mr-2" />
                Disconnect Stripe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Stripe?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove access to your Stripe account. You won't be able to generate
                  verified screenshots until you reconnect. Existing verifications will remain valid.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
