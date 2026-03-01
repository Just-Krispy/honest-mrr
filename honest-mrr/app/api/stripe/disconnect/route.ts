/**
 * Honest MRR — Stripe Disconnect API
 * Allows users to disconnect their Stripe account
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { disconnectStripe } from '@/lib/stripe/oauth'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Disconnect Stripe (delete connection from database)
    await disconnectStripe(user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error disconnecting Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect Stripe' },
      { status: 500 }
    )
  }
}
