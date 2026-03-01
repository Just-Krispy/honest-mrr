-- Honest MRR — Database Schema
-- Verified revenue screenshots with cryptographic proof

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- Stripe connections table (OAuth tokens for accessing user's Stripe data)
CREATE TABLE IF NOT EXISTS public.stripe_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT NOT NULL,
  stripe_user_id TEXT, -- Stripe user ID (for Connect)
  access_token_encrypted TEXT NOT NULL, -- Encrypted with pgcrypto
  refresh_token_encrypted TEXT, -- For token refresh
  scope TEXT, -- OAuth scope granted
  livemode BOOLEAN DEFAULT false, -- Test mode vs live mode
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stripe_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Stripe connections"
  ON public.stripe_connections FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Stripe connections"
  ON public.stripe_connections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Stripe connections"
  ON public.stripe_connections FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_stripe_connections_user_id ON public.stripe_connections(user_id);

-- MRR verifications table (cryptographically signed MRR snapshots)
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_connection_id UUID NOT NULL REFERENCES public.stripe_connections(id) ON DELETE CASCADE,
  
  -- Revenue data
  mrr NUMERIC(10, 2) NOT NULL, -- Monthly Recurring Revenue in cents
  currency TEXT DEFAULT 'usd',
  active_subscriptions INTEGER, -- Number of active subs
  churned_subscriptions INTEGER, -- Churned this month
  new_subscriptions INTEGER, -- New this month
  
  -- Growth metrics
  previous_mrr NUMERIC(10, 2), -- MRR from previous month
  growth_percentage NUMERIC(5, 2), -- % growth
  
  -- Verification proof
  signature TEXT NOT NULL, -- SHA-256 hash of (MRR + timestamp + user_id + secret)
  signature_algorithm TEXT DEFAULT 'SHA-256',
  verification_url TEXT, -- Public URL to verify this screenshot
  qr_code_data TEXT, -- Base64 QR code image
  
  -- Blockchain anchoring (optional)
  blockchain_hash TEXT, -- Transaction hash on Polygon
  blockchain_network TEXT, -- 'polygon-mainnet' or 'polygon-testnet'
  blockchain_anchored_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_public BOOLEAN DEFAULT true, -- Public verification page enabled
  privacy_mode TEXT DEFAULT 'full' CHECK (privacy_mode IN ('full', 'blurred', 'tier-only')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verifications"
  ON public.verifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public verifications are viewable by anyone
CREATE POLICY "Public verifications viewable by all"
  ON public.verifications FOR SELECT USING (is_public = true);

CREATE INDEX idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX idx_verifications_created_at ON public.verifications(created_at);
CREATE INDEX idx_verifications_signature ON public.verifications(signature);

-- Screenshots table (generated PNG images + metadata)
CREATE TABLE IF NOT EXISTS public.screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Screenshot data
  image_url TEXT NOT NULL, -- URL to PNG (stored in Supabase Storage or S3)
  image_width INTEGER DEFAULT 1200,
  image_height INTEGER DEFAULT 630, -- Twitter card dimensions
  file_size_bytes INTEGER,
  
  -- Customization
  show_verified_badge BOOLEAN DEFAULT true,
  show_qr_code BOOLEAN DEFAULT true,
  custom_branding BOOLEAN DEFAULT false, -- Premium feature
  custom_logo_url TEXT,
  background_color TEXT DEFAULT '#000000',
  text_color TEXT DEFAULT '#FFFFFF',
  
  -- Download tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own screenshots"
  ON public.screenshots FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own screenshots"
  ON public.screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_screenshots_user_id ON public.screenshots(user_id);
CREATE INDEX idx_screenshots_verification_id ON public.screenshots(verification_id);

-- Subscriptions table (Pro/Premium tier billing)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'pro', 'premium')),
  plan_interval TEXT CHECK (plan_interval IN ('month', 'year')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Usage limits
  screenshots_per_day INTEGER DEFAULT 1, -- Free: 1, Pro: unlimited, Premium: unlimited
  api_access BOOLEAN DEFAULT false, -- Premium only
  custom_branding BOOLEAN DEFAULT false, -- Premium only
  blockchain_anchoring BOOLEAN DEFAULT false, -- Premium only
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Function to generate verification signature
CREATE OR REPLACE FUNCTION public.generate_verification_signature(
  p_mrr NUMERIC,
  p_timestamp TIMESTAMP WITH TIME ZONE,
  p_user_id UUID
)
RETURNS TEXT AS $$
DECLARE
  secret TEXT := current_setting('app.verification_secret', true);
  data TEXT;
BEGIN
  -- Concatenate data to sign
  data := p_mrr::TEXT || '|' || p_timestamp::TEXT || '|' || p_user_id::TEXT || '|' || secret;
  
  -- Return SHA-256 hash
  RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify signature
CREATE OR REPLACE FUNCTION public.verify_signature(
  p_mrr NUMERIC,
  p_timestamp TIMESTAMP WITH TIME ZONE,
  p_user_id UUID,
  p_signature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  expected_signature TEXT;
BEGIN
  expected_signature := public.generate_verification_signature(p_mrr, p_timestamp, p_user_id);
  RETURN expected_signature = p_signature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate MRR growth percentage
CREATE OR REPLACE FUNCTION public.calculate_growth_percentage(
  p_current_mrr NUMERIC,
  p_previous_mrr NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_previous_mrr = 0 OR p_previous_mrr IS NULL THEN
    RETURN NULL; -- Cannot calculate growth without previous data
  END IF;
  
  RETURN ROUND(((p_current_mrr - p_previous_mrr) / p_previous_mrr) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get latest verification for user
CREATE OR REPLACE FUNCTION public.get_latest_verification(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  mrr NUMERIC,
  growth_percentage NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.mrr, v.growth_percentage, v.created_at
  FROM public.verifications v
  WHERE v.user_id = p_user_id
  ORDER BY v.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create free tier subscription
  INSERT INTO public.subscriptions (user_id, stripe_customer_id, status, plan_name, screenshots_per_day)
  VALUES (NEW.id, '', 'active', 'free', 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Admin view: Active verifications
CREATE OR REPLACE VIEW public.admin_verification_stats AS
SELECT
  DATE_TRUNC('day', v.created_at) AS date,
  COUNT(*) AS verification_count,
  COUNT(DISTINCT v.user_id) AS unique_users,
  SUM(v.mrr) AS total_mrr_verified,
  AVG(v.growth_percentage) AS avg_growth_percentage
FROM public.verifications v
GROUP BY date
ORDER BY date DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Honest MRR schema created successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Set up Stripe Connect OAuth in Stripe dashboard';
  RAISE NOTICE '2. Add verification_secret to Supabase Vault: ALTER DATABASE postgres SET app.verification_secret = ''your-secret''';
  RAISE NOTICE '3. Configure Supabase Storage bucket for screenshots';
END $$;
