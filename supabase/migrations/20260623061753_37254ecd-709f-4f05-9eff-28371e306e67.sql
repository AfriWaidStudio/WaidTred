
-- ============ ENUMS ============
DO $$ BEGIN CREATE TYPE provider_status AS ENUM ('active','inactive','testing','error','disabled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE provider_service_kind AS ENUM ('deposit','payout','virtual_account','transfer','airtime','data','bill','electricity','cable','education','fx','card'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE webhook_status AS ENUM ('received','processing','processed','failed','ignored','duplicate'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ providers ============
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status provider_status NOT NULL DEFAULT 'inactive',
  priority int NOT NULL DEFAULT 100,
  countries text[] NOT NULL DEFAULT '{}',
  service_kinds provider_service_kind[] NOT NULL DEFAULT '{}',
  base_url text,
  logo_url text,
  config jsonb NOT NULL DEFAULT '{}',
  is_sandbox boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage providers" ON public.providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ provider_credentials ============
CREATE TABLE IF NOT EXISTS public.provider_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  key_name text NOT NULL,
  env_var text NOT NULL,
  description text,
  is_sandbox boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, key_name, is_sandbox)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_credentials TO authenticated;
GRANT ALL ON public.provider_credentials TO service_role;
ALTER TABLE public.provider_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage credentials" ON public.provider_credentials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ provider_services ============
CREATE TABLE IF NOT EXISTS public.provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  service_kind provider_service_kind NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  fee_flat numeric(20,4) NOT NULL DEFAULT 0,
  fee_percent numeric(8,4) NOT NULL DEFAULT 0,
  min_amount numeric(20,4) NOT NULL DEFAULT 0,
  max_amount numeric(20,4),
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, service_kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_services TO authenticated;
GRANT ALL ON public.provider_services TO service_role;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage provider services" ON public.provider_services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ provider_routes ============
CREATE TABLE IF NOT EXISTS public.provider_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_kind provider_service_kind NOT NULL,
  country text NOT NULL,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  priority int NOT NULL DEFAULT 100,
  weight int NOT NULL DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  conditions jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(service_kind, country, provider_id)
);
CREATE INDEX IF NOT EXISTS idx_routes_lookup ON public.provider_routes(service_kind, country, enabled, priority);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_routes TO authenticated;
GRANT ALL ON public.provider_routes TO service_role;
ALTER TABLE public.provider_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage routes" ON public.provider_routes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ provider_webhooks ============
CREATE TABLE IF NOT EXISTS public.provider_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  provider_code text,
  event_type text,
  idempotency_key text UNIQUE,
  signature text,
  signature_valid boolean,
  payload jsonb NOT NULL,
  headers jsonb,
  status webhook_status NOT NULL DEFAULT 'received',
  error text,
  processed_at timestamptz,
  attempts int NOT NULL DEFAULT 0,
  related_user_id uuid,
  related_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhooks_provider ON public.provider_webhooks(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON public.provider_webhooks(status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_webhooks TO authenticated;
GRANT ALL ON public.provider_webhooks TO service_role;
ALTER TABLE public.provider_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view webhooks" ON public.provider_webhooks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admins manage webhooks" ON public.provider_webhooks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ provider_logs ============
CREATE TABLE IF NOT EXISTS public.provider_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.providers(id) ON DELETE SET NULL,
  service_kind provider_service_kind,
  direction text NOT NULL DEFAULT 'outbound',
  endpoint text,
  method text,
  request_payload jsonb,
  response_payload jsonb,
  status_code int,
  latency_ms int,
  success boolean,
  error text,
  user_id uuid,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_provider_logs_provider ON public.provider_logs(provider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_logs_user ON public.provider_logs(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.provider_logs TO authenticated;
GRANT ALL ON public.provider_logs TO service_role;
ALTER TABLE public.provider_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view logs" ON public.provider_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_providers_touch ON public.providers;
CREATE TRIGGER trg_providers_touch BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_provider_credentials_touch ON public.provider_credentials;
CREATE TRIGGER trg_provider_credentials_touch BEFORE UPDATE ON public.provider_credentials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_provider_services_touch ON public.provider_services;
CREATE TRIGGER trg_provider_services_touch BEFORE UPDATE ON public.provider_services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_provider_routes_touch ON public.provider_routes;
CREATE TRIGGER trg_provider_routes_touch BEFORE UPDATE ON public.provider_routes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Routing helper ============
CREATE OR REPLACE FUNCTION public.resolve_provider(_service provider_service_kind, _country text)
RETURNS TABLE(provider_id uuid, code text, priority int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.code, r.priority
  FROM provider_routes r
  JOIN providers p ON p.id = r.provider_id
  JOIN provider_services ps ON ps.provider_id = p.id AND ps.service_kind = _service
  WHERE r.service_kind = _service
    AND r.country = _country
    AND r.enabled = true
    AND ps.enabled = true
    AND p.status = 'active'
  ORDER BY r.priority ASC, r.weight DESC;
$$;

-- ============ Seed Paystack + Flutterwave ============
INSERT INTO public.providers (code, name, description, status, priority, countries, service_kinds, base_url, is_sandbox)
VALUES
  ('paystack','Paystack','Nigerian payment gateway with virtual accounts, transfers, airtime, and bills','inactive',10,
    ARRAY['NG','GH','ZA','KE'],
    ARRAY['deposit','payout','virtual_account','transfer','airtime','data','bill','electricity','cable']::provider_service_kind[],
    'https://api.paystack.co', true),
  ('flutterwave','Flutterwave','Pan-African payments with collections, transfers, airtime, bills','inactive',20,
    ARRAY['NG','GH','KE','UG','TZ','ZA','RW'],
    ARRAY['deposit','payout','virtual_account','transfer','airtime','data','bill','electricity','cable','education']::provider_service_kind[],
    'https://api.flutterwave.com/v3', true)
ON CONFLICT (code) DO NOTHING;

-- Seed credentials env-var names
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'secret_key', 'PAYSTACK_SECRET_KEY', 'Paystack secret key (sk_test_ / sk_live_)', true FROM providers p WHERE p.code='paystack'
ON CONFLICT DO NOTHING;
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'public_key', 'PAYSTACK_PUBLIC_KEY', 'Paystack public key', true FROM providers p WHERE p.code='paystack'
ON CONFLICT DO NOTHING;
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'webhook_secret', 'PAYSTACK_WEBHOOK_SECRET', 'Paystack webhook signing secret', true FROM providers p WHERE p.code='paystack'
ON CONFLICT DO NOTHING;
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'secret_key', 'FLUTTERWAVE_SECRET_KEY', 'Flutterwave secret key', true FROM providers p WHERE p.code='flutterwave'
ON CONFLICT DO NOTHING;
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'public_key', 'FLUTTERWAVE_PUBLIC_KEY', 'Flutterwave public key', true FROM providers p WHERE p.code='flutterwave'
ON CONFLICT DO NOTHING;
INSERT INTO public.provider_credentials (provider_id, key_name, env_var, description, is_sandbox)
SELECT p.id, 'webhook_secret', 'FLUTTERWAVE_WEBHOOK_SECRET', 'Flutterwave verif-hash header secret', true FROM providers p WHERE p.code='flutterwave'
ON CONFLICT DO NOTHING;

-- Seed default services for each provider
INSERT INTO public.provider_services (provider_id, service_kind, enabled, fee_percent)
SELECT p.id, unnest(p.service_kinds), true, 1.5 FROM providers p
ON CONFLICT (provider_id, service_kind) DO NOTHING;
