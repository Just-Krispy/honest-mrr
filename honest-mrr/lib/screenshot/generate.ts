/**
 * Honest MRR — Screenshot Generation
 * Generate verified revenue screenshots with Puppeteer
 */

import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { createHash } from 'crypto'

export interface ScreenshotOptions {
  mrr: number
  currency: string
  growthPercentage?: number
  timestamp: Date
  verificationUrl: string
  privacyMode?: 'full' | 'blurred' | 'tier-only'
  customBranding?: {
    logoUrl?: string
    backgroundColor?: string
    textColor?: string
  }
  showVerifiedBadge?: boolean
  showQRCode?: boolean
}

/**
 * Generate verified MRR screenshot
 * Returns PNG buffer
 */
export async function generateScreenshot(
  options: ScreenshotOptions
): Promise<Buffer> {
  const {
    mrr,
    currency,
    growthPercentage,
    timestamp,
    verificationUrl,
    privacyMode = 'full',
    customBranding,
    showVerifiedBadge = true,
    showQRCode = true,
  } = options

  // Generate QR code for verification URL
  const qrCodeDataUrl = showQRCode
    ? await QRCode.toDataURL(verificationUrl, { width: 200, margin: 1 })
    : null

  // Format MRR display based on privacy mode
  let mrrDisplay: string
  if (privacyMode === 'full') {
    mrrDisplay = formatMRR(mrr, currency)
  } else if (privacyMode === 'blurred') {
    mrrDisplay = blurMRR(mrr, currency)
  } else {
    mrrDisplay = getMRRTier(mrr)
  }

  // Generate HTML for screenshot
  const html = generateHTML({
    mrrDisplay,
    growthPercentage,
    timestamp,
    verificationUrl,
    qrCodeDataUrl,
    showVerifiedBadge,
    customBranding,
  })

  // Launch headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Set viewport for Twitter card dimensions
  await page.setViewport({ width: 1200, height: 630 })

  // Set content
  await page.setContent(html, { waitUntil: 'networkidle0' })

  // Take screenshot
  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: false,
  })

  await browser.close()

  return screenshot as Buffer
}

/**
 * Format MRR for display
 */
function formatMRR(mrr: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(mrr)
}

/**
 * Blur MRR for privacy mode
 * Example: $12,345 → $1X,XXX
 */
function blurMRR(mrr: number, currency: string): string {
  const formatted = formatMRR(mrr, currency)
  const parts = formatted.split(',')
  
  if (parts.length === 1) {
    // Less than 1K
    return currency === 'usd' ? '$XXX' : 'XXX'
  }

  // Keep first digit, blur the rest
  const firstPart = parts[0].substring(0, parts[0].length - 1) + 'X'
  const blurredParts = parts.slice(1).map(() => 'XXX')
  
  return [firstPart, ...blurredParts].join(',')
}

/**
 * Get MRR tier for tier-only privacy mode
 */
function getMRRTier(mrr: number): string {
  if (mrr < 1000) return 'Verified $0-$1K MRR'
  if (mrr < 5000) return 'Verified $1K-$5K MRR'
  if (mrr < 10000) return 'Verified $5K-$10K MRR'
  if (mrr < 50000) return 'Verified $10K-$50K MRR'
  if (mrr < 100000) return 'Verified $50K-$100K MRR'
  if (mrr < 500000) return 'Verified $100K-$500K MRR'
  return 'Verified $500K+ MRR'
}

/**
 * Generate HTML for screenshot
 */
function generateHTML(data: {
  mrrDisplay: string
  growthPercentage?: number
  timestamp: Date
  verificationUrl: string
  qrCodeDataUrl: string | null
  showVerifiedBadge: boolean
  customBranding?: {
    logoUrl?: string
    backgroundColor?: string
    textColor?: string
  }
}): string {
  const {
    mrrDisplay,
    growthPercentage,
    timestamp,
    verificationUrl,
    qrCodeDataUrl,
    showVerifiedBadge,
    customBranding,
  } = data

  const bgColor = customBranding?.backgroundColor || '#000000'
  const textColor = customBranding?.textColor || '#FFFFFF'
  const logoUrl = customBranding?.logoUrl

  const timestampFormatted = timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 1200px;
            height: 630px;
            background: ${bgColor};
            color: ${textColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          
          .container {
            text-align: center;
            padding: 60px;
          }
          
          .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 40px;
            border-radius: 50%;
            background: #1a1a1a;
          }
          
          .mrr {
            font-size: 96px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: -2px;
          }
          
          .growth {
            font-size: 48px;
            margin-bottom: 40px;
            opacity: 0.8;
          }
          
          .growth.positive {
            color: #10b981;
          }
          
          .growth.negative {
            color: #ef4444;
          }
          
          .verified-badge {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            background: rgba(16, 185, 129, 0.1);
            border: 2px solid #10b981;
            border-radius: 50px;
            padding: 12px 24px;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 30px;
          }
          
          .badge-icon {
            width: 32px;
            height: 32px;
          }
          
          .timestamp {
            font-size: 20px;
            opacity: 0.6;
            margin-bottom: 40px;
          }
          
          .qr-container {
            position: absolute;
            bottom: 40px;
            right: 40px;
            text-align: center;
          }
          
          .qr-code {
            width: 150px;
            height: 150px;
            border: 3px solid ${textColor};
            border-radius: 12px;
            padding: 8px;
            background: white;
          }
          
          .qr-label {
            font-size: 14px;
            margin-top: 8px;
            opacity: 0.7;
          }
          
          .watermark {
            position: absolute;
            bottom: 40px;
            left: 40px;
            font-size: 18px;
            opacity: 0.5;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${logoUrl ? `<img src="${logoUrl}" class="logo" alt="Logo" />` : ''}
          
          <div class="mrr">${mrrDisplay}</div>
          
          ${
            growthPercentage !== undefined
              ? `
            <div class="growth ${growthPercentage >= 0 ? 'positive' : 'negative'}">
              ${growthPercentage >= 0 ? '+' : ''}${growthPercentage}% MoM
            </div>
          `
              : ''
          }
          
          ${
            showVerifiedBadge
              ? `
            <div class="verified-badge">
              <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" />
              </svg>
              <span>Verified by Honest MRR</span>
            </div>
          `
              : ''
          }
          
          <div class="timestamp">${timestampFormatted}</div>
        </div>
        
        ${
          qrCodeDataUrl
            ? `
          <div class="qr-container">
            <img src="${qrCodeDataUrl}" class="qr-code" alt="Verify QR Code" />
            <div class="qr-label">Scan to verify</div>
          </div>
        `
            : ''
        }
        
        ${!customBranding?.logoUrl ? '<div class="watermark">honestmrr.com</div>' : ''}
      </body>
    </html>
  `
}

/**
 * Generate cryptographic signature for verification
 */
export function generateSignature(
  mrr: number,
  timestamp: Date,
  userId: string
): string {
  const secret = process.env.VERIFICATION_SECRET || 'default-secret-change-in-production'
  const data = `${mrr}|${timestamp.toISOString()}|${userId}|${secret}`
  
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Verify cryptographic signature
 */
export function verifySignature(
  mrr: number,
  timestamp: Date,
  userId: string,
  signature: string
): boolean {
  const expectedSignature = generateSignature(mrr, timestamp, userId)
  return expectedSignature === signature
}
