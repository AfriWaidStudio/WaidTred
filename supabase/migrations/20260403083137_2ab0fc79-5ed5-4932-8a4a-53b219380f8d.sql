
-- WaidTred Admin Database Schema

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- KYC status enum
CREATE TYPE public.kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');

-- Account status enum
CREATE TYPE public.account_status AS ENUM ('active', 'frozen', 'suspended', 'closed');

-- Transaction type enum
CREATE TYPE public.tx_type AS ENUM ('transfer', 'airtime', 'data', 'bill', 'payment', 'received', 'qr-pay');

-- Transaction status enum
CREATE TYPE public.tx_status AS ENUM ('completed', 'pending', 'failed', 'reversed', 'flagged');

-- Integration status enum
CREATE TYPE public.integration_status AS ENUM ('active', 'inactive', 'error', 'testing');

-- Alert severity enum
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  country TEXT DEFAULT 'GH',
  kyc_status kyc_status DEFAULT 'pending',
  account_status account_status DEFAULT 'active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- WALLETS TABLE
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  currency_type TEXT NOT NULL DEFAULT 'SMAI_SIKA',
  total_balance NUMERIC(18,2) DEFAULT 0,
  available_balance NUMERIC(18,2) DEFAULT 0,
  locked_balance NUMERIC(18,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- TRANSACTIONS TABLE
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type tx_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT DEFAULT 'SMK',
  sender_country TEXT,
  receiver_country TEXT,
  recipient TEXT,
  status tx_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- INTEGRATIONS TABLE
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  region TEXT,
  status integration_status DEFAULT 'inactive',
  endpoint TEXT,
  api_key_name TEXT,
  config JSONB DEFAULT '{}',
  last_tested TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ALERTS TABLE
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  severity alert_severity DEFAULT 'medium',
  category TEXT,
  target_id TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all wallets" ON public.wallets
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all transactions" ON public.transactions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage integrations" ON public.integrations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage alerts" ON public.alerts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- SEED: Default integrations
INSERT INTO public.integrations (provider_name, service_type, region, status, endpoint) VALUES
  ('MTN Mobile Money', 'mobile_money', 'GH', 'inactive', 'https://api.mtn.com/momo'),
  ('Flutterwave', 'payment_gateway', 'GLOBAL', 'inactive', 'https://api.flutterwave.com/v3'),
  ('Paystack', 'payment_gateway', 'NG', 'inactive', 'https://api.paystack.co'),
  ('Reloadly Airtime', 'airtime', 'GLOBAL', 'inactive', 'https://topups.reloadly.com'),
  ('Visa Direct', 'card_network', 'GLOBAL', 'inactive', 'https://sandbox.api.visa.com'),
  ('Mastercard Send', 'card_network', 'GLOBAL', 'inactive', 'https://sandbox.mastercard.com'),
  ('M-Pesa', 'mobile_money', 'KE', 'inactive', 'https://sandbox.safaricom.co.ke'),
  ('Chipper Cash', 'remittance', 'AF', 'inactive', 'https://api.chipper.cash'),
  ('WorldRemit', 'remittance', 'GLOBAL', 'inactive', 'https://api.worldremit.com'),
  ('Stripe', 'payment_gateway', 'GLOBAL', 'inactive', 'https://api.stripe.com/v1');

-- Seed alerts
INSERT INTO public.alerts (title, description, severity, category) VALUES
  ('Large transfer detected', 'Transfer of 15,000 SMK from user in Nigeria to Ghana flagged for review', 'high', 'fraud'),
  ('Integration endpoint down', 'MTN Mobile Money API returning 503 errors since 14:30 UTC', 'critical', 'integration'),
  ('Unusual login activity', 'Multiple failed login attempts from IP 41.58.xxx.xxx targeting 3 accounts', 'high', 'security'),
  ('KYC verification backlog', '47 pending KYC verifications older than 48 hours', 'medium', 'compliance'),
  ('Recharge failures spike', 'Airtel Nigeria recharges failing at 23% rate (normal: 2%)', 'high', 'service');
