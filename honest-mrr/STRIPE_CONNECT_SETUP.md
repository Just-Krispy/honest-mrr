# Stripe Connect OAuth Setup Guide

Complete guide to setting up Stripe Connect for Honest MRR.

---

## Step 1: Enable Stripe Connect

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Settings** → **Connect**
3. Click **Get Started** (if not already enabled)

---

## Step 2: Create Connect Platform

1. In **Connect Settings**, choose **Platform or Marketplace**
2. Set **Platform name**: "Honest MRR"
3. Set **Support email**: your support email
4. Click **Save**

---

## Step 3: Get Client ID

1. Still in **Connect Settings**, scroll to **OAuth settings**
2. Copy your **Client ID** (starts with `ca_`)
3. Add to `.env.local`:
   ```
   STRIPE_CLIENT_ID=ca_xxxxxxxxxxxxx
   ```

---

## Step 4: Configure OAuth Redirect URI

1. In **OAuth settings** → **Redirects**
2. Click **+ Add URI**
3. Add:
   - Development: `http://localhost:3000/api/stripe/callback`
   - Production: `https://yourdomain.com/api/stripe/callback`
4. Click **Save**

---

## Step 5: Set OAuth Permissions

1. In **OAuth settings** → **Permissions**
2. Set scope to **Read-only** (default)
3. This ensures Honest MRR cannot charge cards or modify data
4. Click **Save**

---

## Step 6: Generate Encryption Keys

Run these commands in your terminal:

```bash
# Generate encryption key (32 bytes = 64 hex characters)
openssl rand -hex 32

# Generate OAuth state secret
openssl rand -base64 32

# Generate verification secret
openssl rand -base64 32
```

Add to `.env.local`:

```bash
ENCRYPTION_KEY=your_64_char_hex_key_here
OAUTH_STATE_SECRET=your_base64_secret_here
VERIFICATION_SECRET=your_base64_secret_here
```

---

## Step 7: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **service_role key** (starts with `eyJ`)
5. ⚠️ **KEEP THIS SECRET** — Never commit to git or expose client-side
6. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

---

## Complete .env.local Example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Connect
STRIPE_CLIENT_ID=ca_xxxxx

# Security Keys
ENCRYPTION_KEY=a1b2c3d4e5f6... (64 hex chars)
OAUTH_STATE_SECRET=randombase64secret==
VERIFICATION_SECRET=anotherbase64secret==

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing OAuth Flow

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/dashboard`
3. Click "Connect with Stripe"
4. You should be redirected to Stripe authorization page
5. Click "Connect" to authorize (test mode)
6. You should be redirected back to dashboard with success message

---

## Troubleshooting

**"Invalid redirect URI" error**
→ Verify redirect URI in Stripe Connect settings matches exactly:
`http://localhost:3000/api/stripe/callback` (development)

**"Invalid client_id" error**
→ Verify `STRIPE_CLIENT_ID` starts with `ca_` and is from Connect settings

**"State verification failed" error**
→ Ensure `OAUTH_STATE_SECRET` is set in `.env.local`

**"Failed to decrypt access token" error**
→ Ensure `ENCRYPTION_KEY` is exactly 64 hex characters (32 bytes)

**"Unauthorized" error**
→ Ensure user is logged in to Supabase Auth before connecting Stripe

---

## Production Deployment

Before deploying to production:

1. **Switch to live mode:**
   - Use live Stripe keys (`pk_live_...`, `sk_live_...`)
   - Stripe Connect client ID works for both test and live mode

2. **Update redirect URI:**
   - Add production URL to Stripe Connect settings
   - `https://yourdomain.com/api/stripe/callback`

3. **Regenerate secrets:**
   - Use different `ENCRYPTION_KEY` for production
   - Use different `OAUTH_STATE_SECRET` for production
   - **Never reuse development secrets in production**

4. **Set environment variables in Vercel/Railway:**
   - All keys from `.env.local`
   - Ensure `NEXT_PUBLIC_APP_URL` points to production domain

---

## Security Best Practices

✅ **Never commit `.env.local`** — Add to `.gitignore`  
✅ **Use strong encryption keys** — 32 bytes minimum  
✅ **Rotate secrets periodically** — Every 6-12 months  
✅ **Read-only Stripe access** — Cannot charge cards or modify data  
✅ **Token encryption** — AES-256-GCM before database storage  
✅ **CSRF protection** — State token prevents replay attacks  
✅ **HTTPS only in production** — Encrypt data in transit

---

## Next Steps

Once OAuth is working:

1. Test MRR calculation with real Stripe data
2. Generate verified screenshot
3. Test public verification page
4. Deploy to production
5. Launch! 🚀

---

**Questions?** Check `BUILD_STATUS.md` for implementation roadmap.
