/**
 * Honest MRR — Screenshot Download API
 * Download screenshot by ID (increments download counter)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const screenshotId = params.id

    // Fetch screenshot record
    const { data: screenshot, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('id', screenshotId)
      .single()

    if (error || !screenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      )
    }

    // Increment download counter
    await supabase
      .from('screenshots')
      .update({
        download_count: (screenshot.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', screenshotId)

    // Redirect to public URL (Supabase Storage)
    return NextResponse.redirect(screenshot.image_url)
  } catch (error: any) {
    console.error('Error downloading screenshot:', error)
    return NextResponse.json(
      { error: 'Failed to download screenshot' },
      { status: 500 }
    )
  }
}
