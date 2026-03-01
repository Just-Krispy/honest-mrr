/**
 * Honest MRR — Stripe Connect OAuth Utilities
 * Handle Stripe Connect authorization flow and token management
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createHash, randomBytes } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
)

/**
 * Generate Stripe Connect OAuth authorization URL
 * @param userId User ID to associate with the connection
 * @param state CSRF protection state token
 * @returns Authorization URL to redirect user to
 */
export function generateStripeConnectURL(userId: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRIPE_CLIENT_ID!,
    scope: 'read_only', // Read-only access (cannot charge cards or modify data)
    response_type: 'code',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/callback`,
    state: state, // CSRF protection
    'stripe_user[email]': '', // Optional: pre-fill user email
  })

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 * @param code Authorization code from Stripe callback
 * @returns Stripe Connect account details + access token
 */
export async function exchangeCodeForToken(code: string) {
  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      stripeUserId: response.stripe_user_id,
      scope: response.scope,
      livemode: response.livemode,
    }
  } catch (error: any) {
    console.error('Error exchanging code for token:', error)
    throw new Error(`Failed to connect Stripe account: ${error.message}`)
  }
}

/**
 * Encrypt sensitive token before storing in database
 * Uses AES-256-GCM encryption
 */
export function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32-byte hex string
  const iv = randomBytes(16) // Initialization vector
  
  const cipher = require('crypto').createCipheriv(algorithm, key, iv)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag().toString('hex')
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Decrypt token from database
 */
export function decryptToken(encryptedToken: string): string {
  const algorithm = 'aes-256-gcm'
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
  
  const parts = encryptedToken.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = require('crypto').createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Store Stripe connection in database
 */
export async function storeStripeConnection(
  userId: string,
  tokenData: {
    accessToken: string
    refreshToken?: string
    stripeUserId: string
    scope: string
    livemode: boolean
  }
) {
  const { accessToken, refreshToken, stripeUserId, scope, livemode } = tokenData

  // Encrypt tokens before storing
  const accessTokenEncrypted = encryptToken(accessToken)
  const refreshTokenEncrypted = refreshToken ? encryptToken(refreshToken) : null

  // Store in database
  const { data, error } = await supabase
    .from('stripe_connections')
    .upsert({
      user_id: userId,
      stripe_account_id: stripeUserId,
      stripe_user_id: stripeUserId,
      access_token_encrypted: accessTokenEncrypted,
      refresh_token_encrypted: refreshTokenEncrypted,
      scope: scope,
      livemode: livemode,
      connected_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error storing Stripe connection:', error)
    throw new Error('Failed to store Stripe connection')
  }

  return data
}

/**
 * Get Stripe connection for user
 */
export async function getStripeConnection(userId: string) {
  const { data, error } = await supabase
    .from('stripe_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No connection found
      return null
    }
    console.error('Error fetching Stripe connection:', error)
    throw new Error('Failed to fetch Stripe connection')
  }

  return data
}

/**
 * Get decrypted access token for user
 */
export async function getAccessToken(userId: string): Promise<string | null> {
  const connection = await getStripeConnection(userId)
  
  if (!connection) {
    return null
  }

  try {
    return decryptToken(connection.access_token_encrypted)
  } catch (error) {
    console.error('Error decrypting access token:', error)
    throw new Error('Failed to decrypt access token')
  }
}

/**
 * Disconnect Stripe account (delete connection)
 */
export async function disconnectStripe(userId: string) {
  const { error } = await supabase
    .from('stripe_connections')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error disconnecting Stripe:', error)
    throw new Error('Failed to disconnect Stripe')
  }

  return { success: true }
}

/**
 * Refresh access token if expired (using refresh token)
 */
export async function refreshAccessToken(userId: string) {
  const connection = await getStripeConnection(userId)
  
  if (!connection || !connection.refresh_token_encrypted) {
    throw new Error('No refresh token available')
  }

  const refreshToken = decryptToken(connection.refresh_token_encrypted)

  try {
    const response = await stripe.oauth.token({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    // Update stored access token
    const accessTokenEncrypted = encryptToken(response.access_token)

    await supabase
      .from('stripe_connections')
      .update({
        access_token_encrypted: accessTokenEncrypted,
        last_synced_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return response.access_token
  } catch (error: any) {
    console.error('Error refreshing access token:', error)
    throw new Error(`Failed to refresh access token: ${error.message}`)
  }
}

/**
 * Generate CSRF state token for OAuth flow
 */
export function generateStateToken(userId: string): string {
  const timestamp = Date.now().toString()
  const random = randomBytes(16).toString('hex')
  const data = `${userId}:${timestamp}:${random}`
  
  // Hash with secret
  const secret = process.env.OAUTH_STATE_SECRET || 'default-secret-change-in-production'
  const hash = createHash('sha256').update(data + secret).digest('hex')
  
  // Return base64-encoded userId:timestamp:random:hash
  return Buffer.from(`${userId}:${timestamp}:${random}:${hash}`).toString('base64')
}

/**
 * Verify CSRF state token
 */
export function verifyStateToken(state: string, expectedUserId: string): boolean {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf8')
    const parts = decoded.split(':')
    
    if (parts.length !== 4) {
      return false
    }
    
    const [userId, timestamp, random, hash] = parts
    
    // Check user ID matches
    if (userId !== expectedUserId) {
      return false
    }
    
    // Check timestamp is recent (within 10 minutes)
    const now = Date.now()
    const tokenTime = parseInt(timestamp)
    const tenMinutes = 10 * 60 * 1000
    
    if (now - tokenTime > tenMinutes) {
      return false
    }
    
    // Verify hash
    const secret = process.env.OAUTH_STATE_SECRET || 'default-secret-change-in-production'
    const expectedHash = createHash('sha256')
      .update(`${userId}:${timestamp}:${random}${secret}`)
      .digest('hex')
    
    return hash === expectedHash
  } catch (error) {
    console.error('Error verifying state token:', error)
    return false
  }
}
