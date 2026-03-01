# Honest MRR — Verified Revenue Screenshots

**Stop the fake MRR culture. Prove your revenue is real.**

Generate cryptographically verified revenue screenshots from Stripe with public verification links. No more photoshopped numbers, no more lifetime deals disguised as MRR.

## Why Honest MRR?

**The Problem:**
- Fake revenue screenshots flooding X/Twitter (#buildinpublic)
- Lifetime deals misrepresented as recurring revenue
- Exaggerated Stripe screenshots (inspect element → edit number → screenshot)
- Survivorship bias killing realistic indie hackers

**The Solution:**
- Connect your real Stripe account (OAuth, read-only access)
- Generate verified screenshots with cryptographic signatures
- Public verification page anyone can check
- Optional blockchain anchoring for immutable proof

## Features

✅ **Stripe Integration** — Read-only OAuth access to your real revenue  
✅ **Verified Screenshots** — Cryptographically signed, tamper-proof  
✅ **Public Verification** — QR code → anyone can verify authenticity  
✅ **MRR Analytics** — Track growth, churn, trends over time  
✅ **Anti-Fake Badge** — Display "Verified by Honest MRR" on screenshots  
✅ **Privacy Controls** — Blur exact numbers, show growth % only  
✅ **Blockchain Anchoring** (optional) — Immutable proof on Polygon

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Stripe Connect (for OAuth)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_CLIENT_ID=ca_xxx  # Get from Stripe Connect settings

# App URL (for OAuth redirect)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Polygon for blockchain anchoring
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_PRIVATE_KEY=your_private_key
```

### 3. Create Supabase Project

```bash
npx supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## How It Works

### 1. Connect Stripe

- User clicks "Connect Stripe"
- Stripe OAuth flow (read-only access to revenue data)
- Honest MRR stores Stripe account ID + access token (encrypted)

### 2. Fetch Real MRR

```typescript
// Fetch all active subscriptions from Stripe
const subscriptions = await stripe.subscriptions.list({
  status: 'active',
  limit: 100
})

// Calculate MRR
const mrr = subscriptions.data.reduce((total, sub) => {
  const amount = sub.items.data[0].price.unit_amount / 100
  const interval = sub.items.data[0].price.recurring.interval
  
  // Normalize to monthly
  if (interval === 'year') return total + (amount / 12)
  return total + amount
}, 0)
```

### 3. Generate Verified Screenshot

```typescript
// Create verification record in database
const verification = await supabase
  .from('verifications')
  .insert({
    user_id: user.id,
    mrr: mrr,
    timestamp: new Date(),
    signature: generateSignature(mrr, timestamp, user.id)
  })

// Generate screenshot with Puppeteer
const screenshot = await generateScreenshot({
  mrr: mrr,
  growth: calculateGrowth(mrr, previousMrr),
  timestamp: new Date(),
  verificationUrl: `https://honestmrr.com/verify/${verification.id}`,
  qrCode: generateQRCode(verificationUrl)
})

// Return PNG image
return screenshot.buffer
```

### 4. Public Verification

Anyone can visit:
```
https://honestmrr.com/verify/{verification_id}
```

Verification page shows:
- ✅ Verified screenshot exists
- ✅ Timestamp matches
- ✅ Cryptographic signature valid
- ✅ Connected Stripe account (last 4 digits)
- ❌ Fake/tampered screenshot (signature invalid)

## Screenshot Options

### Standard Screenshot
- MRR amount (e.g., "$12,345")
- Growth % (e.g., "+23% vs last month")
- Timestamp
- Verified badge
- QR code → verification page

### Privacy Mode
- Blur exact MRR (e.g., "$1X,XXX")
- Show growth % only
- "Verified $10K-$50K MRR tier"

### Custom Branding (Premium)
- Add your logo
- Custom colors
- Remove "Honest MRR" watermark

## Pricing

**Free Tier:**
- 1 verified screenshot/day
- Public verification links
- Basic analytics (7 days history)

**Pro ($29/mo):**
- Unlimited screenshots
- Advanced analytics (12 months history)
- Growth charts, churn rate, cohort analysis
- Privacy mode (blur numbers)
- Export to PNG/SVG

**Premium ($99/mo):**
- Everything in Pro
- API access (generate screenshots programmatically)
- Custom branding (add your logo)
- Blockchain anchoring (Polygon)
- Priority support

## Security & Privacy

✅ **Read-only Stripe access** — Cannot charge cards or modify data  
✅ **Encrypted tokens** — Stripe access tokens stored encrypted in Supabase  
✅ **No revenue data stored** — Only verification hashes + MRR snapshots  
✅ **GDPR compliant** — Delete account = delete all data  
✅ **Cryptographic signatures** — SHA-256 hash (MRR + timestamp + user ID + secret)

## Anti-Fake Detection

**Red flags Honest MRR catches:**
- Screenshot edited (signature invalid)
- Lifetime deals counted as MRR (Stripe data shows one-time charge)
- Refunds hidden (Stripe data includes net revenue after refunds)
- Test mode transactions (Honest MRR only verifies live mode)

## Use Cases

**1. Build-in-Public on X/Twitter**
- Share verified MRR screenshots weekly
- Followers can click QR code to verify authenticity
- Stand out from fake revenue claims

**2. Investor Pitches**
- Include verified revenue screenshots in pitch decks
- Investors can verify on the spot

**3. Acquisition Discussions**
- Buyers want proof of revenue before offers
- Verified screenshots = credibility

**4. Community Accountability**
- Indie Hackers, WIP.co, Reddit r/SaaS
- Build trust with verifiable metrics

## Roadmap

**v1.0 (Weeks 1-2):**
- [x] Stripe OAuth integration
- [x] MRR calculation
- [x] Screenshot generation
- [x] Public verification page
- [x] Free + Pro tiers

**v1.1 (Week 3):**
- [ ] Lemon Squeezy support
- [ ] Privacy mode (blur numbers)
- [ ] Custom branding (Premium)

**v1.2 (Week 4):**
- [ ] Blockchain anchoring (Polygon)
- [ ] API access
- [ ] Growth charts + analytics

**v2.0 (Month 2):**
- [ ] Fake detection AI (analyze screenshot metadata)
- [ ] Browser extension (verify screenshots on X/Twitter inline)
- [ ] Community reputation score (verified builders get badges)

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API routes + Supabase PostgreSQL
- **Auth:** Supabase Auth + Stripe Connect OAuth
- **Payments:** Stripe subscriptions (for Pro/Premium tiers)
- **Screenshots:** Puppeteer headless browser
- **Verification:** SHA-256 signatures + QR codes
- **Blockchain:** Polygon (optional, for immutable proof)

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

## Contributing

This project is open source. PRs welcome!

**Priority areas:**
- Lemon Squeezy integration
- Paddle support
- Fake detection improvements
- Mobile app (React Native)

## License

MIT License — Free to use, modify, distribute

---

**Built with VibeStack 🦞**  
**Fighting fake MRR one screenshot at a time** 💯
