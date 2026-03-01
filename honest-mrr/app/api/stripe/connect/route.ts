/**
 * Honest MRR — Stripe Connect OAuth Initiation
 * Redirects user to Stripe authorization page
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateStripeConnectURL, generateStateToken } from '@/lib/stripe/oauth'

export async function GET(request: NextRequest) {
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

    // Generate CSRF protection state token
    const state = generateStateToken(user.id)

    // Generate Stripe Connect authorization URL
    const authUrl = generateStripeConnectURL(user.id, state)

    // Store state in cookie for verification on callback
    const response = NextResponse.redirect(authUrl)
    response.cookies.set('stripe_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60, // 10 minutes
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error initiating Stripe Connect:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Stripe Connect' },
      { status: 500 }
    )
  }
}
