# Vercel Deployment Guide

**Estimated time:** 15-20 minutes

---

## Step 1: Import Repository to Vercel

1. Go to **vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **Just-Krispy/honest-mrr** from your GitHub repos
4. Click **"Import"**

---

## Step 2: Configure Project Settings

### Framework Preset
- **Framework:** Next.js
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

### Environment Variables (Add These)

Click **"Environment Variables"** and add:

```bash
# Supabase (Production - create new project at supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe (Live Mode - get from stripe.com/dashboard)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CLIENT_ID=ca_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Encryption (Generate new secrets)
ENCRYPTION_KEY=<run: openssl rand -base64 32>
OAUTH_STATE_SECRET=<run: openssl rand -base64 32>
VERIFICATION_SECRET=<run: openssl rand -base64 32>

# URLs (Update after first deploy)
NEXT_PUBLIC_APP_URL=https://honest-mrr.vercel.app
STRIPE_REDIRECT_URI=https://honest-mrr.vercel.app/api/stripe/callback
```

**⚠️ Important Notes:**
- Don't use test keys from `.env.example` — generate new production secrets
- Update `NEXT_PUBLIC_APP_URL` and `STRIPE_REDIRECT_URI` after first deploy (Vercel gives you the URL)
- Keep `ENCRYPTION_KEY` secret and backed up (needed to decrypt Stripe tokens)

---

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Copy your deployment URL (e.g., `https://honest-mrr.vercel.app`)

---

## Step 4: Configure Supabase (Production)

### Create New Project
1. Go to **supabase.com/dashboard**
2. Click **"New Project"**
3. Name: `honest-mrr-prod`
4. Database Password: **Generate strong password** (save it!)
5. Region: Choose closest to your users (e.g., `us-east-1`)
6. Click **"Create new project"** (takes ~2 minutes)

### Run Migrations
1. Install Supabase CLI (if not already):
   ```bash
   npm install -g supabase
   ```

2. Link to production project:
   ```bash
   cd ~/.openclaw/workspace/honest-mrr
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

### Configure Storage Bucket
1. In Supabase dashboard → **Storage**
2. Click **"New bucket"**
3. Name: `screenshots`
4. **Public bucket:** ✅ Yes
5. Click **"Create bucket"**

### Enable RLS (Row Level Security)
- RLS policies already defined in migration file
- Verify in **Authentication** → **Policies** that tables have policies enabled

---

## Step 5: Configure Stripe (Live Mode)

### Switch to Live Mode
1. Go to **stripe.com/dashboard**
2. Toggle **"Test mode"** → **"Live mode"** (top right)

### Get API Keys
1. **Developers** → **API keys**
2. Copy:
   - **Publishable key** (`pk_live_...`)
   - **Secret key** (`sk_live_...`) — click "Reveal"

### Configure Stripe Connect
1. **Connect** → **Settings** → **Integration**
2. **Client ID**: Copy this (starts with `ca_...`)
3. **Redirect URIs**: Add `https://honest-mrr.vercel.app/api/stripe/callback`
4. **OAuth settings**:
   - Enable: ✅ Standard accounts
   - Permissions: `read_write` (will be restricted to read-only in code)

### Create Webhook (for subscriptions)
1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://honest-mrr.vercel.app/api/webhooks/stripe`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing secret** (`whsec_...`) → Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

---

## Step 6: Update Environment Variables

1. Go to **vercel.com/dashboard** → Your project → **Settings** → **Environment Variables**
2. Update these with production values:
   - `NEXT_PUBLIC_SUPABASE_URL` (from Supabase project settings)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase API settings)
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase API settings)
   - `STRIPE_SECRET_KEY` (from Stripe dashboard)
   - `STRIPE_CLIENT_ID` (from Stripe Connect settings)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (from Stripe dashboard)
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - `STRIPE_REDIRECT_URI` (your Vercel URL + `/api/stripe/callback`)
   - `STRIPE_WEBHOOK_SECRET` (from Stripe webhook settings)

3. **Redeploy** after updating env vars:
   - Go to **Deployments** → Click **"..."** on latest → **Redeploy**

---

## Step 7: Test Production Deployment

### Test Flow (Use Real Stripe Test Mode First!)
1. **Visit site**: `https://honest-mrr.vercel.app`
2. **Sign up**: Create account (email + password or OAuth)
3. **Connect Stripe**: Click "Connect Stripe" → OAuth flow
4. **Generate screenshot**: Click "Generate Screenshot" → should create verified image
5. **Verify**: Scan QR code → check verification page shows green ✅

### Common Issues

**"Database connection failed"**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Verify migrations ran (`supabase db push`)

**"Stripe OAuth failed"**
- Check `STRIPE_REDIRECT_URI` matches Vercel URL exactly
- Verify `STRIPE_CLIENT_ID` is from live mode (not test mode)

**"Screenshot generation timeout"**
- Puppeteer may need more memory on Vercel (upgrade to Pro plan if needed)
- Check Vercel function logs: **Deployments** → Click deployment → **Functions**

**"Cannot read property 'id' of undefined"**
- Check Supabase RLS policies allow authenticated users to read their own data
- Verify `supabase.auth.getUser()` is returning user correctly

---

## Step 8: Add Custom Domain (Optional)

1. Buy domain (e.g., `honestmrr.com` via Namecheap, Google Domains)
2. In Vercel → **Settings** → **Domains** → **Add**
3. Enter domain: `honestmrr.com`
4. Follow DNS instructions (add A/CNAME records)
5. Wait for SSL certificate (5-10 minutes)
6. Update env vars:
   - `NEXT_PUBLIC_APP_URL=https://honestmrr.com`
   - `STRIPE_REDIRECT_URI=https://honestmrr.com/api/stripe/callback`
7. Redeploy

---

## Step 9: Enable Monitoring (Optional but Recommended)

### PostHog (Product Analytics)
1. Sign up: **posthog.com**
2. Create project → Copy API key
3. Add to Vercel env vars: `NEXT_PUBLIC_POSTHOG_KEY`
4. Add PostHog script to `app/layout.tsx`

### Sentry (Error Tracking)
1. Sign up: **sentry.io**
2. Create Next.js project → Copy DSN
3. Add to Vercel env vars: `NEXT_PUBLIC_SENTRY_DSN`
4. Install: `npm install @sentry/nextjs`
5. Run: `npx @sentry/wizard -i nextjs`

---

## Step 10: Launch Checklist

Before announcing publicly:

- [ ] Test full user flow (signup → connect → generate → verify)
- [ ] Verify Stripe webhooks working (create test subscription)
- [ ] Check mobile responsive (test on iPhone, Android)
- [ ] Verify QR codes scan correctly
- [ ] Test verification page (signature validation)
- [ ] Enable error tracking (Sentry)
- [ ] Set up analytics (PostHog)
- [ ] Add privacy policy + terms of service pages
- [ ] Test payment flow (create test subscription in live mode)
- [ ] Monitor Vercel function logs (check for errors)

---

## Post-Launch

### Beta Testing (Week 1)
1. Invite 5-10 indie hackers
2. Ask for feedback
3. Fix critical bugs
4. Iterate on UX

### Product Hunt Launch (Week 2)
1. Prepare assets (screenshots, demo video, logo)
2. Write compelling description
3. Schedule launch (Tuesday-Thursday, 12:01 AM PST)
4. Engage in comments all day

### Marketing (Ongoing)
1. **X/Twitter**: Share verified screenshots weekly
2. **Indie Hackers**: Post milestones + revenue updates
3. **Reddit r/SaaS**: Share story (avoid spam, provide value)
4. **Blog**: Write "How I built this" post
5. **Discord/Slack**: Join indie maker communities

---

## Need Help?

**Vercel Docs**: https://vercel.com/docs
**Supabase Docs**: https://supabase.com/docs
**Stripe Docs**: https://stripe.com/docs

**Common Vercel Commands**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from CLI
vercel

# Deploy to production
vercel --prod

# Check logs
vercel logs
```

---

🚀 **Ready to ship!** Follow this guide and you'll be live in 15-20 minutes.
