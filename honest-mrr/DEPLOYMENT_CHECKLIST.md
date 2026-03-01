# 🚀 Deployment Checklist — Honest MRR

**Target:** Deploy to production (Vercel + Supabase + Stripe)  
**Time Estimate:** 2-3 hours  
**Goal:** Live product at honestmrr.com

---

## ✅ Pre-Deployment (Local Testing)

### 1. Install Dependencies
```bash
cd ~/.openclaw/workspace/honest-mrr
npm install
```

**Expected:** All dependencies install without errors  
**If errors:** Check package.json versions, run `npm audit fix`

---

### 2. Set Up Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

**Required variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CLIENT_ID=ca_xxxxx

# Security
ENCRYPTION_KEY=your_64_char_hex_key
OAUTH_STATE_SECRET=your_random_secret
VERIFICATION_SECRET=your_verification_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate secrets:**
```bash
# Encryption key (64 hex characters)
openssl rand -hex 32

# OAuth state secret
openssl rand -base64 32

# Verification secret
openssl rand -base64 32
```

---

### 3. Set Up Supabase (Development)

1. **Create project:** [supabase.com](https://supabase.com)
2. **Copy credentials** to `.env.local`
3. **Run migrations:**
   ```bash
   npx supabase db push
   ```
4. **Create storage bucket:**
   - Go to Storage → New Bucket
   - Name: `screenshots`
   - Public: ✅ Checked
   - Add policies (see `SUPABASE_STORAGE_SETUP.md`)

**Verify:**
- [ ] Tables created (`users`, `stripe_connections`, `verifications`, `screenshots`, `subscriptions`)
- [ ] RLS policies enabled
- [ ] Storage bucket `screenshots` exists and is public

---

### 4. Set Up Stripe Connect (Development)

1. **Enable Stripe Connect:** [dashboard.stripe.com/connect](https://dashboard.stripe.com/connect)
2. **Get Client ID:** Settings → Connect → Copy Client ID (`ca_xxx`)
3. **Add redirect URI:** `http://localhost:3000/api/stripe/callback`
4. **Add to `.env.local`:** `STRIPE_CLIENT_ID=ca_xxx`

**Verify:**
- [ ] Stripe Connect enabled
- [ ] Client ID copied
- [ ] Redirect URI configured

---

### 5. Test Locally

```bash
npm run dev
```

**Visit:** [http://localhost:3000](http://localhost:3000)

**Test flow:**
1. [ ] Landing page loads
2. [ ] Click "Get Started Free" → redirects to dashboard
3. [ ] Click "Login" → auth page loads
4. [ ] Sign up with email/password → check email for confirmation
5. [ ] Sign in → redirects to dashboard
6. [ ] Click "Connect with Stripe" → OAuth flow works
7. [ ] Authorize Stripe → returns to dashboard (connected state)
8. [ ] MRR display shows correct amount
9. [ ] Click "Generate Verified Screenshot" → screenshot generates (~3-5 seconds)
10. [ ] Screenshot preview appears
11. [ ] Click "Download" → PNG file downloads
12. [ ] Click "Verify" → opens verification page
13. [ ] Verification page shows green checkmark (✅ Verified)
14. [ ] Screenshot history table shows new screenshot

**If any step fails:** Debug before deploying to production

---

## 🚀 Production Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Honest MRR MVP"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/honest-mrr.git
git push -u origin main
```

**Verify:**
- [ ] Code pushed to GitHub
- [ ] Repository is private (or public if you want open source)

---

### 2. Deploy to Vercel

1. **Visit:** [vercel.com](https://vercel.com)
2. **Click:** "New Project"
3. **Import:** Your GitHub repository
4. **Configure:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Add Environment Variables:** (copy all from `.env.local`)

**Production environment variables:**
```bash
# Supabase (production project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (live mode keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_CLIENT_ID=ca_xxxxx  # Same for test and live

# Security (regenerate for production!)
ENCRYPTION_KEY=your_new_64_char_hex_key
OAUTH_STATE_SECRET=your_new_random_secret
VERIFICATION_SECRET=your_new_verification_secret

# App URL (your production domain)
NEXT_PUBLIC_APP_URL=https://honestmrr.com
```

6. **Click:** "Deploy"
7. **Wait:** ~2 minutes for build + deployment

**Verify:**
- [ ] Deployment successful
- [ ] Visit Vercel URL (e.g., `https://honest-mrr.vercel.app`)
- [ ] Landing page loads

---

### 3. Set Up Supabase (Production)

1. **Create new project:** [supabase.com](https://supabase.com)
   - Name: "honest-mrr-production"
   - Region: Choose closest to your users
2. **Copy credentials** to Vercel environment variables
3. **Run migrations:**
   ```bash
   npx supabase db push --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   ```
4. **Create storage bucket:** `screenshots` (public)
5. **Configure OAuth providers:**
   - Authentication → Providers → Google (add Client ID/Secret)
   - Authentication → Providers → GitHub (add Client ID/Secret)

**Verify:**
- [ ] Production database has all tables
- [ ] RLS policies enabled
- [ ] Storage bucket `screenshots` exists
- [ ] OAuth providers configured

---

### 4. Configure Stripe (Production)

1. **Switch to live mode:** Toggle in Stripe dashboard
2. **Update Stripe Connect redirect URI:**
   - Settings → Connect → Redirects
   - Add: `https://honestmrr.com/api/stripe/callback`
3. **Create webhook endpoint:**
   - Developers → Webhooks → Add endpoint
   - URL: `https://honestmrr.com/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `invoice.payment_*`
   - Copy webhook secret to Vercel env vars
4. **Create subscription products:**
   - Products → Add Product
   - **Pro:** $29/month (or $290/year)
   - **Premium:** $99/month (or $990/year)
   - Copy price IDs to Vercel env vars

**Verify:**
- [ ] Live mode enabled
- [ ] OAuth redirect URI updated
- [ ] Webhook endpoint configured
- [ ] Subscription products created

---

### 5. Configure Custom Domain

1. **Vercel Dashboard:** Settings → Domains
2. **Add domain:** `honestmrr.com`
3. **Update DNS:** (at your domain registrar)
   - Type: `A` → Value: `76.76.21.21`
   - Type: `CNAME` → Name: `www` → Value: `cname.vercel-dns.com`
4. **Wait:** DNS propagation (~5-60 minutes)
5. **SSL:** Vercel auto-provisions Let's Encrypt certificate

**Verify:**
- [ ] Domain added to Vercel
- [ ] DNS records updated
- [ ] SSL certificate active (🔒 in browser)
- [ ] `https://honestmrr.com` loads

---

### 6. Update Environment Variables (Post-Deploy)

**Vercel environment variables:**
- Update `NEXT_PUBLIC_APP_URL` to `https://honestmrr.com`
- **Redeploy** after updating (Vercel → Deployments → Redeploy)

**Supabase:**
- Update OAuth redirect URLs:
  - Authentication → URL Configuration
  - Site URL: `https://honestmrr.com`
  - Redirect URLs: `https://honestmrr.com/**`

**Stripe:**
- Ensure all URLs point to `https://honestmrr.com`

---

## ✅ Post-Deployment Testing

**Visit:** [https://honestmrr.com](https://honestmrr.com)

**Test full flow:**
1. [ ] Landing page loads
2. [ ] Sign up with email/password works
3. [ ] Email confirmation received
4. [ ] Sign in works
5. [ ] Google OAuth works
6. [ ] GitHub OAuth works
7. [ ] Connect Stripe works (live mode)
8. [ ] MRR display shows correct amount
9. [ ] Generate screenshot works
10. [ ] Screenshot downloads
11. [ ] Verification page works (green checkmark)
12. [ ] QR code scans correctly (mobile test)
13. [ ] Screenshot history displays
14. [ ] Disconnect Stripe works
15. [ ] Dashboard responsive on mobile

**Performance:**
- [ ] Page load time <2 seconds
- [ ] Screenshot generation <5 seconds
- [ ] No console errors

**Security:**
- [ ] All pages HTTPS (🔒 in browser)
- [ ] No exposed secrets in source code
- [ ] RLS policies working (users can't access others' data)

---

## 🐛 Troubleshooting

### Issue: Build fails on Vercel

**Solution:**
- Check build logs for errors
- Ensure all dependencies in `package.json`
- Verify TypeScript compiles locally (`npm run build`)
- Check environment variables are set

---

### Issue: Supabase connection error

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is not paused
- Verify RLS policies allow access

---

### Issue: Stripe OAuth fails

**Solution:**
- Verify `STRIPE_CLIENT_ID` is correct
- Check redirect URI matches exactly: `https://honestmrr.com/api/stripe/callback`
- Ensure OAuth state secret is set

---

### Issue: Screenshot generation fails

**Solution:**
- Check Puppeteer is installed (`npm list puppeteer`)
- Verify Vercel deployment includes Puppeteer (may need config)
- Check Supabase Storage bucket exists and is public
- Verify `ENCRYPTION_KEY` is 64 hex characters

---

### Issue: Verification page shows "Invalid"

**Solution:**
- Verify `VERIFICATION_SECRET` matches between environments
- Check signature generation function is consistent
- Ensure timestamp is stored correctly

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- **Dashboard:** [vercel.com/YOUR_PROJECT/analytics](https://vercel.com)
- Track: Page views, unique visitors, Core Web Vitals

### Supabase Logs
- **Dashboard:** [supabase.com/dashboard](https://supabase.com/dashboard)
- Monitor: Database queries, auth events, storage uploads

### Stripe Dashboard
- **Dashboard:** [dashboard.stripe.com](https://dashboard.stripe.com)
- Track: Subscriptions, revenue, churn, webhook deliveries

### Error Tracking (Optional)
- **Sentry:** [sentry.io](https://sentry.io) (free tier)
- Captures errors in production
- Add to Next.js: `npm install @sentry/nextjs`

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] SSL certificate active
- [ ] Custom domain working
- [ ] OAuth flows work
- [ ] Payment flows work
- [ ] Email notifications work (sign up, password reset)

### Launch Day
- [ ] Announce on X/Twitter
- [ ] Post on Indie Hackers
- [ ] Post on Reddit (r/SaaS, r/indiehackers)
- [ ] Email existing network
- [ ] Product Hunt teaser (schedule for 2 weeks out)

### Post-Launch (Week 1)
- [ ] Monitor error logs daily
- [ ] Respond to user feedback
- [ ] Fix critical bugs within 24 hours
- [ ] Track key metrics (signups, conversions, churn)

---

## 💰 Pricing Configuration

**Stripe Products:**

**Pro Tier:**
- Price: $29/month or $290/year (save $58)
- Features: Unlimited screenshots, 12-month analytics, privacy mode
- Stripe Product ID: `prod_xxx`
- Stripe Price IDs: `price_xxx` (monthly), `price_xxx` (annual)

**Premium Tier:**
- Price: $99/month or $990/year (save $198)
- Features: Everything in Pro + custom branding + API access
- Stripe Product ID: `prod_xxx`
- Stripe Price IDs: `price_xxx` (monthly), `price_xxx` (annual)

**Add price IDs to Vercel:**
```bash
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_ANNUAL_PRICE_ID=price_xxx
```

---

## 📈 Success Metrics (Week 1)

**Target:**
- 100-500 signups
- 10-50 Stripe connections
- 50-200 screenshots generated
- 10-50 Pro tier conversions ($290-$1,450 MRR)

**Track:**
- Signup conversion rate (landing → signup)
- Connection rate (signup → Stripe connected)
- Screenshot generation rate (connected → generated screenshot)
- Upgrade rate (free → Pro)

**Tools:**
- Vercel Analytics (traffic)
- Supabase Dashboard (signups, database activity)
- Stripe Dashboard (subscriptions, revenue)
- Google Analytics (optional, for detailed funnels)

---

## 🚀 You're Ready to Launch!

**Estimated time to production:** 2-3 hours  
**Time to first customer:** 1-2 days  
**Time to $1K MRR:** 1-2 weeks  

**Let's ship this! 💯🦞🔥**
