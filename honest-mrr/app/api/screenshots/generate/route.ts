/**
 * Honest MRR — Screenshot Generation API
 * Fetch MRR from Stripe, generate verified screenshot with Puppeteer
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getStripeConnection, getAccessToken } from '@/lib/stripe/oauth'
import { calculateMRR, calculateGrowth } from '@/lib/stripe/calculate-mrr'
import { generateScreenshot, generateSignature } from '@/lib/screenshot/generate'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseAuth = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { privacyMode = 'full', customBranding } = body

    // Check if user has Stripe connected
    const connection = await getStripeConnection(user.id)
    
    if (!connection) {
      return NextResponse.json(
        { error: 'Stripe account not connected' },
        { status: 400 }
      )
    }

    // Get subscription tier and usage limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      )
    }

    // Check daily screenshot limit (free tier: 1/day)
    if (subscription.plan_name === 'free') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())

      if (count && count >= subscription.screenshots_per_day) {
        return NextResponse.json(
          { 
            error: 'Daily screenshot limit reached. Upgrade to Pro for unlimited screenshots.',
            limit: subscription.screenshots_per_day,
            used: count
          },
          { status: 429 }
        )
      }
    }

    // Check feature access (custom branding = Premium only)
    if (customBranding && !subscription.custom_branding) {
      return NextResponse.json(
        { error: 'Custom branding requires Premium plan' },
        { status: 403 }
      )
    }

    // Get access token
    const accessToken = await getAccessToken(user.id)
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to retrieve Stripe access token' },
        { status: 500 }
      )
    }

    // Calculate current MRR from Stripe
    console.log('Fetching MRR from Stripe...')
    const mrrMetrics = await calculateMRR(connection.stripe_account_id, accessToken)

    // Get previous MRR for growth calculation
    const { data: previousVerification } = await supabase
      .from('verifications')
      .select('mrr')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const previousMrr = previousVerification?.mrr || 0
    const growthPercentage = calculateGrowth(mrrMetrics.mrr, previousMrr)

    // Generate verification signature
    const timestamp = new Date()
    const signature = generateSignature(mrrMetrics.mrr, timestamp, user.id)

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('verifications')
      .insert({
        user_id: user.id,
        stripe_connection_id: connection.id,
        mrr: mrrMetrics.mrr,
        currency: mrrMetrics.currency,
        active_subscriptions: mrrMetrics.activeSubscriptions,
        churned_subscriptions: mrrMetrics.churnedSubscriptions,
        new_subscriptions: mrrMetrics.newSubscriptions,
        previous_mrr: previousMrr,
        growth_percentage: growthPercentage,
        signature: signature,
        signature_algorithm: 'SHA-256',
        verification_url: '', // Set after we have the ID
        is_public: true,
        privacy_mode: privacyMode,
      })
      .select()
      .single()

    if (verificationError) {
      console.error('Error creating verification:', verificationError)
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      )
    }

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${verification.id}`

    // Update verification with URL
    await supabase
      .from('verifications')
      .update({ verification_url: verificationUrl })
      .eq('id', verification.id)

    // Generate screenshot with Puppeteer
    console.log('Generating screenshot...')
    const screenshotBuffer = await generateScreenshot({
      mrr: mrrMetrics.mrr,
      currency: mrrMetrics.currency,
      growthPercentage,
      timestamp,
      verificationUrl,
      privacyMode: privacyMode as 'full' | 'blurred' | 'tier-only',
      customBranding,
      showVerifiedBadge: true,
      showQRCode: true,
    })

    // Upload screenshot to Supabase Storage
    const fileName = `${user.id}/${verification.id}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, screenshotBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading screenshot:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload screenshot' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName)

    // Create screenshot record
    const { data: screenshotRecord, error: screenshotError } = await supabase
      .from('screenshots')
      .insert({
        verification_id: verification.id,
        user_id: user.id,
        image_url: publicUrl,
        image_width: 1200,
        image_height: 630,
        file_size_bytes: screenshotBuffer.length,
        show_verified_badge: true,
        show_qr_code: true,
        custom_branding: !!customBranding,
        custom_logo_url: customBranding?.logoUrl,
        background_color: customBranding?.backgroundColor || '#000000',
        text_color: customBranding?.textColor || '#FFFFFF',
      })
      .select()
      .single()

    if (screenshotError) {
      console.error('Error creating screenshot record:', screenshotError)
      return NextResponse.json(
        { error: 'Failed to create screenshot record' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      verification: {
        id: verification.id,
        mrr: mrrMetrics.mrr,
        currency: mrrMetrics.currency,
        growthPercentage,
        verificationUrl,
        signature,
        timestamp: timestamp.toISOString(),
      },
      screenshot: {
        id: screenshotRecord.id,
        url: publicUrl,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/screenshots/download/${screenshotRecord.id}`,
      },
    })
  } catch (error: any) {
    console.error('Error generating screenshot:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate screenshot' },
      { status: 500 }
    )
  }
}
