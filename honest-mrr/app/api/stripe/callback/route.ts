/**
 * Honest MRR — Stripe Connect OAuth Callback
 * Handles Stripe authorization callback and stores access token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  exchangeCodeForToken,
  storeStripeConnection,
  verifyStateToken,
} from '@/lib/stripe/oauth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth error (user denied access)
    if (error) {
      console.error('Stripe OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=${encodeURIComponent(errorDescription || 'Stripe connection failed')}`,
          request.url
        )
      )
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=Invalid+callback+parameters', request.url)
      )
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=Unauthorized', request.url)
      )
    }

    // Verify CSRF state token
    const cookieStore = cookies()
    const storedState = cookieStore.get('stripe_oauth_state')?.value

    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { stored: storedState, received: state })
      return NextResponse.redirect(
        new URL('/dashboard?error=Invalid+state+token', request.url)
      )
    }

    // Verify state token is valid and matches user
    if (!verifyStateToken(state, user.id)) {
      console.error('State verification failed')
      return NextResponse.redirect(
        new URL('/dashboard?error=State+verification+failed', request.url)
      )
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code)

    // Store encrypted token in database
    await storeStripeConnection(user.id, tokenData)

    // Clear state cookie
    const response = NextResponse.redirect(
      new URL('/dashboard?connected=true', request.url)
    )
    response.cookies.delete('stripe_oauth_state')

    return response
  } catch (error: any) {
    console.error('Error in Stripe callback:', error)
    return NextResponse.redirect(
      new URL(
        `/dashboard?error=${encodeURIComponent(error.message || 'Failed to connect Stripe')}`,
        request.url
      )
    )
  }
}
