-- Launch security hardening: protect wallet primitives and transaction integrity.
-- Financial mutations must only be reachable through purpose-built, authorised RPCs.

-- Internal wallet primitives were executable by PUBLIC by PostgreSQL default. That
-- allowed an authenticated client to credit any wallet by calling the RPC directly.
REVOKE ALL ON FUNCTION public.ensure_wallet(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_wallet_movement(uuid, text, numeric, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_drip_releases() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.execute_due_scheduled_actions() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.ensure_wallet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_wallet_movement(uuid, text, numeric, text, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_drip_releases() TO service_role;
GRANT EXECUTE ON FUNCTION public.execute_due_scheduled_actions() TO service_role;

-- Keep only the user-facing, self-authorising financial entry points callable.
REVOKE ALL ON FUNCTION public.send_money(uuid, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_money(uuid, numeric, text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.confirm_funding(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_funding(uuid, boolean, text) TO service_role;
REVOKE ALL ON FUNCTION public.create_wallet_lock(text, numeric, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_wallet_lock(text, numeric, numeric) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.create_scheduled_action(text, timestamptz, text, text, uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_scheduled_action(text, timestamptz, text, text, uuid, numeric) TO authenticated, service_role;

-- Wallet rows cannot be edited directly, even by dashboard clients. Administrative
-- corrections must go through a ledger-writing RPC (added below).
DROP POLICY IF EXISTS "Admins can update all wallets" ON public.wallets;

CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(
  _wallet_id uuid,
  _direction text,
  _amount numeric,
  _reason text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _user_id uuid;
  _ledger_id uuid;
BEGIN
  IF _admin IS NULL OR NOT (
    public.has_role(_admin, 'admin') OR public.has_role(_admin, 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _direction NOT IN ('credit', 'debit') OR _amount <= 0 THEN
    RAISE EXCEPTION 'Invalid adjustment';
  END IF;
  IF nullif(trim(_reason), '') IS NULL THEN
    RAISE EXCEPTION 'Adjustment reason is required';
  END IF;

  SELECT user_id INTO _user_id FROM public.wallets WHERE id = _wallet_id FOR UPDATE;
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Wallet not found'; END IF;

  SELECT public.process_wallet_movement(
    _user_id, _direction, _amount, 'admin_adjustment', _reason,
    'admin_user', _admin
  ) INTO _ledger_id;

  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, after_state, metadata)
  VALUES (
    _admin, 'wallet_adjustment', 'wallet', _wallet_id::text,
    jsonb_build_object('direction', _direction, 'amount', _amount, 'reason', _reason),
    jsonb_build_object('ledger_id', _ledger_id)
  );
  RETURN _ledger_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_wallet(uuid, text, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_wallet(uuid, text, numeric, text) TO authenticated, service_role;

-- Clients may create only their own pending transaction intents. They cannot forge
-- successful history records; final states belong to trusted server/provider flows.
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own pending transactions" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Preserve the accounting identity on every wallet row.
ALTER TABLE public.wallets
  DROP CONSTRAINT IF EXISTS wallets_balance_identity,
  ADD CONSTRAINT wallets_balance_identity
    CHECK (
      total_balance >= 0 AND available_balance >= 0 AND locked_balance >= 0
      AND total_balance = available_balance + locked_balance
    ) NOT VALID;

-- Exact-match recipient discovery without opening the profiles table to bulk reads.
CREATE OR REPLACE FUNCTION public.find_transfer_recipient(_query text)
RETURNS TABLE(id uuid, full_name text, email text, phone text, avatar_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _needle text := lower(trim(_query));
BEGIN
  IF _caller IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF length(_needle) < 5 OR length(_needle) > 254 THEN
    RAISE EXCEPTION 'Enter a valid phone number or email address';
  END IF;

  RETURN QUERY
  SELECT p.id, p.full_name, p.email, p.phone, p.avatar_url
  FROM public.profiles p
  WHERE p.id <> _caller
    AND p.account_status = 'active'
    AND (lower(p.email) = _needle OR lower(p.phone) = _needle)
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.find_transfer_recipient(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_transfer_recipient(text) TO authenticated, service_role;

-- Private KYC evidence storage. Database rows store object paths, never public URLs.
ALTER TABLE public.kyc_documents
  ADD COLUMN IF NOT EXISTS selfie_url text,
  ADD COLUMN IF NOT EXISTS country text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'kyc_documents_user_id_fkey') THEN
    ALTER TABLE public.kyc_documents
      ADD CONSTRAINT kyc_documents_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 'kyc-documents', false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users upload own KYC evidence" ON storage.objects;
CREATE POLICY "Users upload own KYC evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "Users view own KYC evidence" ON storage.objects;
CREATE POLICY "Users view own KYC evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );
DROP POLICY IF EXISTS "Users delete own pending KYC evidence" ON storage.objects;
CREATE POLICY "Users delete own pending KYC evidence" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.review_kyc_document(
  _document_id uuid,
  _approve boolean,
  _notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer uuid := auth.uid();
  _document public.kyc_documents%ROWTYPE;
BEGIN
  IF _reviewer IS NULL OR NOT (
    public.has_role(_reviewer, 'admin') OR public.has_role(_reviewer, 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO _document FROM public.kyc_documents WHERE id = _document_id FOR UPDATE;
  IF _document.id IS NULL THEN RAISE EXCEPTION 'KYC submission not found'; END IF;
  IF _document.status <> 'pending' THEN RAISE EXCEPTION 'KYC submission already reviewed'; END IF;

  UPDATE public.kyc_documents
  SET status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
      reviewer_id = _reviewer,
      reviewer_notes = _notes,
      reviewed_at = now()
  WHERE id = _document_id;

  UPDATE public.profiles
  SET kyc_status = CASE WHEN _approve THEN 'verified'::public.kyc_status ELSE 'rejected'::public.kyc_status END,
      updated_at = now()
  WHERE id = _document.user_id;

  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, after_state)
  VALUES (
    _reviewer, 'kyc_review', 'kyc_document', _document_id::text,
    jsonb_build_object('approved', _approve, 'notes', _notes, 'user_id', _document.user_id)
  );
END;
$$;

-- Extend the existing country registry used by product availability and routing.
ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS phone_prefix text,
  ADD COLUMN IF NOT EXISTS mobile_money_supported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS banking_supported boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  DROP CONSTRAINT IF EXISTS countries_status_check,
  ADD CONSTRAINT countries_status_check CHECK (status IN ('active', 'inactive', 'restricted'));
UPDATE public.countries SET status = CASE WHEN is_enabled THEN 'active' ELSE 'inactive' END;
GRANT SELECT ON public.countries TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.countries TO authenticated;
DROP POLICY IF EXISTS "view countries" ON public.countries;
DROP POLICY IF EXISTS "admin countries" ON public.countries;
CREATE POLICY "public view active countries" ON public.countries
  FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "admins manage countries" ON public.countries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_countries_touch ON public.countries;
CREATE TRIGGER trg_countries_touch BEFORE UPDATE ON public.countries
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.countries(code, name, currency_code, phone_prefix, mobile_money_supported, banking_supported, status, is_enabled)
VALUES
  ('GH', 'Ghana', 'GHS', '+233', true, true, 'active', true),
  ('NG', 'Nigeria', 'NGN', '+234', true, true, 'active', true),
  ('KE', 'Kenya', 'KES', '+254', true, true, 'active', true),
  ('ZA', 'South Africa', 'ZAR', '+27', false, true, 'inactive', false),
  ('GB', 'United Kingdom', 'GBP', '+44', false, true, 'inactive', false)
ON CONFLICT (code) DO UPDATE SET
  phone_prefix = EXCLUDED.phone_prefix,
  mobile_money_supported = EXCLUDED.mobile_money_supported,
  banking_supported = EXCLUDED.banking_supported;

-- Provider-owned account and transaction state machines.
CREATE TABLE IF NOT EXISTS public.virtual_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id),
  country_code text NOT NULL REFERENCES public.countries(code),
  currency_code text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text,
  bank_code text,
  provider_customer_reference text,
  provider_account_reference text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'disabled', 'closed', 'error')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, provider_account_reference),
  UNIQUE(provider_id, account_number)
);
CREATE INDEX IF NOT EXISTS idx_virtual_accounts_user ON public.virtual_accounts(user_id, status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_virtual_accounts_one_active
  ON public.virtual_accounts(user_id, country_code, currency_code)
  WHERE status IN ('pending', 'active');
ALTER TABLE public.virtual_accounts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.virtual_accounts TO authenticated;
CREATE POLICY "users view own virtual accounts" ON public.virtual_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins view virtual accounts" ON public.virtual_accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.bank_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES public.countries(code),
  currency_code text NOT NULL,
  bank_code text,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  provider_recipient_reference text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, country_code, bank_name, account_number)
);
ALTER TABLE public.bank_beneficiaries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON public.bank_beneficiaries TO authenticated;
GRANT INSERT (user_id, country_code, currency_code, bank_code, bank_name, account_number, account_name) ON public.bank_beneficiaries TO authenticated;
GRANT UPDATE (country_code, currency_code, bank_code, bank_name, account_number, account_name, updated_at) ON public.bank_beneficiaries TO authenticated;
CREATE POLICY "users manage own beneficiaries" ON public.bank_beneficiaries FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.provider_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  provider_id uuid NOT NULL REFERENCES public.providers(id),
  internal_transaction_id uuid REFERENCES public.transactions(id),
  service_kind public.provider_service_kind NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  amount numeric(20,2) NOT NULL CHECK (amount > 0),
  wallet_amount numeric(20,2) NOT NULL CHECK (wallet_amount > 0),
  fx_rate numeric(20,8) NOT NULL DEFAULT 1 CHECK (fx_rate > 0),
  fee numeric(20,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  currency_code text NOT NULL,
  country_code text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  provider_reference text,
  client_reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'reversed', 'refunded', 'requires_review')),
  request_payload jsonb,
  response_payload jsonb,
  error_code text,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_tx_reference ON public.provider_transactions(provider_id, provider_reference) WHERE provider_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provider_tx_user ON public.provider_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provider_tx_status ON public.provider_transactions(status, created_at);
ALTER TABLE public.provider_transactions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.provider_transactions TO authenticated;
CREATE POLICY "users view own provider transactions" ON public.provider_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins view provider transactions" ON public.provider_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  beneficiary_id uuid NOT NULL REFERENCES public.bank_beneficiaries(id),
  provider_transaction_id uuid REFERENCES public.provider_transactions(id),
  amount numeric(20,2) NOT NULL CHECK (amount > 0),
  wallet_amount numeric(20,2) NOT NULL CHECK (wallet_amount > 0),
  fee numeric(20,2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  currency_code text NOT NULL,
  country_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'successful', 'failed', 'reversed', 'rejected', 'cancelled')),
  risk_score numeric(8,2),
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  approval_required boolean NOT NULL DEFAULT true,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawal_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawal_requests(status, created_at);
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.withdrawal_requests TO authenticated;
CREATE POLICY "users view own withdrawals" ON public.withdrawal_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admins view withdrawals" ON public.withdrawal_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.webhook_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.provider_webhooks(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.providers(id),
  reason text NOT NULL,
  last_error text,
  attempts integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  replayed_by uuid REFERENCES public.profiles(id),
  replayed_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(webhook_id)
);
ALTER TABLE public.provider_webhooks ADD COLUMN IF NOT EXISTS normalized_event jsonb;
ALTER TABLE public.webhook_dead_letters ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.webhook_dead_letters TO authenticated;
CREATE POLICY "admins view webhook dead letters" ON public.webhook_dead_letters FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

DROP TRIGGER IF EXISTS trg_virtual_accounts_touch ON public.virtual_accounts;
CREATE TRIGGER trg_virtual_accounts_touch BEFORE UPDATE ON public.virtual_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_beneficiaries_touch ON public.bank_beneficiaries;
CREATE TRIGGER trg_beneficiaries_touch BEFORE UPDATE ON public.bank_beneficiaries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_provider_transactions_touch ON public.provider_transactions;
CREATE TRIGGER trg_provider_transactions_touch BEFORE UPDATE ON public.provider_transactions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_withdrawals_touch ON public.withdrawal_requests;
CREATE TRIGGER trg_withdrawals_touch BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE ALL ON FUNCTION public.review_kyc_document(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kyc_document(uuid, boolean, text) TO authenticated, service_role;

-- Harden the core internal-transfer entry point with account, KYC and velocity gates.
CREATE OR REPLACE FUNCTION public.send_money(
  _recipient_id uuid,
  _amount numeric,
  _description text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender uuid := auth.uid();
  _tx uuid;
  _recipient_name text;
  _sender_name text;
BEGIN
  IF _sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _recipient_id IS NULL OR _sender = _recipient_id THEN RAISE EXCEPTION 'Invalid recipient'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 100000 OR scale(_amount) > 2 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  SELECT full_name INTO _sender_name
  FROM public.profiles
  WHERE id = _sender AND account_status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Sender account must be active'; END IF;

  SELECT full_name INTO _recipient_name
  FROM public.profiles
  WHERE id = _recipient_id AND account_status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Recipient is unavailable'; END IF;

  PERFORM public.enforce_kyc_limit(_sender, _amount, 'transfer');

  PERFORM public.ensure_wallet(_recipient_id);
  INSERT INTO public.transactions(user_id, type, title, description, amount, currency, recipient, status)
  VALUES (_sender, 'transfer', 'Transfer to ' || coalesce(_recipient_name, 'user'), _description, _amount, 'SMK', _recipient_name, 'completed')
  RETURNING id INTO _tx;

  INSERT INTO public.transactions(user_id, type, title, description, amount, currency, recipient, status)
  VALUES (_recipient_id, 'received', 'Transfer from ' || coalesce(_sender_name, 'user'), _description, _amount, 'SMK', _sender_name, 'completed');

  PERFORM public.process_wallet_movement(_sender, 'debit', _amount, 'transfer_out', _description, 'transaction', _tx);
  PERFORM public.process_wallet_movement(_recipient_id, 'credit', _amount, 'transfer_in', _description, 'transaction', _tx);
  INSERT INTO public.notifications(user_id, type, title, body, link)
  VALUES (_recipient_id, 'tx', 'Money received', 'You received ' || _amount || ' Smai Sika', '/dashboard/history');
  RETURN _tx;
END;
$$;

-- Cron execution is concurrency-safe: each due row is locked exactly once.
CREATE OR REPLACE FUNCTION public.execute_due_scheduled_actions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _action public.scheduled_actions%ROWTYPE;
  _count integer := 0;
  _target uuid;
  _tx uuid;
BEGIN
  FOR _action IN
    SELECT * FROM public.scheduled_actions
    WHERE status = 'pending' AND scheduled_for <= now()
    ORDER BY scheduled_for
    LIMIT 100
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      _target := _action.target_user_id;
      IF _target IS NULL AND _action.target_contact IS NOT NULL THEN
        SELECT id INTO _target FROM public.profiles
        WHERE lower(phone) = lower(_action.target_contact) OR lower(email) = lower(_action.target_contact)
        LIMIT 1;
      END IF;

      IF _action.action_type = 'reminder' THEN
        INSERT INTO public.notifications(user_id, type, title, body)
        VALUES (_action.user_id, 'reminder', 'Reminder', coalesce(_action.message, 'Reminder'));
      ELSIF _action.action_type = 'notify_contact' AND _target IS NOT NULL THEN
        INSERT INTO public.notifications(user_id, type, title, body)
        VALUES (_target, 'message', 'Message from contact', coalesce(_action.message, ''));
      ELSIF _action.action_type = 'send_money' AND _target IS NOT NULL AND _action.amount > 0 THEN
        PERFORM public.enforce_kyc_limit(_action.user_id, _action.amount, 'transfer');
        INSERT INTO public.transactions(user_id, type, title, description, amount, currency, status)
        VALUES (_action.user_id, 'transfer', 'Scheduled transfer', _action.message, _action.amount, 'SMK', 'completed')
        RETURNING id INTO _tx;
        INSERT INTO public.transactions(user_id, type, title, description, amount, currency, status)
        VALUES (_target, 'received', 'Scheduled transfer received', _action.message, _action.amount, 'SMK', 'completed');
        PERFORM public.process_wallet_movement(_action.user_id, 'debit', _action.amount, 'transfer_out', _action.message, 'scheduled_action', _action.id);
        PERFORM public.process_wallet_movement(_target, 'credit', _action.amount, 'transfer_in', _action.message, 'transaction', _tx);
        INSERT INTO public.notifications(user_id, type, title, body, link)
        VALUES (_target, 'tx', 'Money received', _action.amount || ' Smai Sika received', '/dashboard/history');
      ELSIF _action.action_type = 'request_money' AND _target IS NOT NULL THEN
        INSERT INTO public.payment_requests(requester_id, payer_id, payer_contact, amount, reason)
        VALUES (_action.user_id, _target, _action.target_contact, _action.amount, _action.message);
        INSERT INTO public.notifications(user_id, type, title, body)
        VALUES (_target, 'request', 'Payment request', 'You have a request for ' || _action.amount || ' Smai Sika');
      ELSE
        RAISE EXCEPTION 'Scheduled action target or amount is invalid';
      END IF;

      UPDATE public.scheduled_actions SET status = 'executed', executed_at = now() WHERE id = _action.id;
      _count := _count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.scheduled_actions
      SET status = 'failed', result = jsonb_build_object('error', SQLERRM), executed_at = now()
      WHERE id = _action.id;
    END;
  END LOOP;
  RETURN _count;
END;
$$;

-- Maintenance jobs that mint/accrue value are service-only.
REVOKE ALL ON FUNCTION public.process_staking_accrual() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_staking_accrual() TO service_role;
REVOKE ALL ON FUNCTION public.snapshot_civilization_metrics() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.snapshot_civilization_metrics() TO service_role;

-- These two civilization primitives previously allowed arbitrary reserve consumption
-- and treasury credits. Limit them to administrators until purpose-specific flows exist.
REVOKE ALL ON FUNCTION public.onyix_consume(uuid, uuid, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.onyix_consume(uuid, uuid, numeric, text) TO service_role;
REVOKE ALL ON FUNCTION public.entity_treasury_move(uuid, text, numeric, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.entity_treasury_move(uuid, text, numeric, text, text, text, uuid) TO service_role;

-- Sensitive profile state is changed only through audited admin RPCs. Regular users
-- retain access to editable presentation/contact fields.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, country, avatar_url, updated_at) ON public.profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_account_status(_user_id uuid, _status public.account_status)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _before public.account_status;
BEGIN
  IF _admin IS NULL OR NOT (public.has_role(_admin, 'admin') OR public.has_role(_admin, 'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT account_status INTO _before FROM public.profiles WHERE id = _user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  UPDATE public.profiles SET account_status = _status, updated_at = now() WHERE id = _user_id;
  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, before_state, after_state)
  VALUES (_admin, 'account_status_change', 'user', _user_id::text,
    jsonb_build_object('account_status', _before), jsonb_build_object('account_status', _status));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_account_status(uuid, public.account_status) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(uuid, public.account_status) TO authenticated, service_role;

-- Transaction final states are provider/server-owned. Admins may flag a record for
-- investigation, but cannot relabel money movement as reversed without a reversal.
DROP POLICY IF EXISTS "Admins can update all transactions" ON public.transactions;
REVOKE UPDATE ON public.transactions FROM authenticated;

CREATE OR REPLACE FUNCTION public.admin_flag_transaction(_transaction_id uuid, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _user_id uuid;
  _before public.tx_status;
BEGIN
  IF _admin IS NULL OR NOT (public.has_role(_admin, 'admin') OR public.has_role(_admin, 'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF nullif(trim(_reason), '') IS NULL THEN RAISE EXCEPTION 'Flag reason is required'; END IF;
  SELECT user_id, status INTO _user_id, _before FROM public.transactions WHERE id = _transaction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  UPDATE public.transactions SET status = 'flagged' WHERE id = _transaction_id;
  INSERT INTO public.fraud_events(user_id, severity, event_type, description, action_taken)
  VALUES (_user_id, 'high', 'admin_transaction_flag', _reason, 'transaction_flagged');
  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, before_state, after_state)
  VALUES (_admin, 'transaction_flag', 'transaction', _transaction_id::text,
    jsonb_build_object('status', _before), jsonb_build_object('status', 'flagged', 'reason', _reason));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_flag_transaction(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_flag_transaction(uuid, text) TO authenticated, service_role;

-- Tiered identity state and configurable money limits.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS kyc_tier smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kyc_approved_at timestamptz,
  DROP CONSTRAINT IF EXISTS profiles_kyc_tier_check,
  ADD CONSTRAINT profiles_kyc_tier_check CHECK (kyc_tier BETWEEN 0 AND 3);

CREATE TABLE IF NOT EXISTS public.kyc_tier_limits (
  tier smallint PRIMARY KEY CHECK (tier BETWEEN 0 AND 3),
  per_transaction_limit numeric(20,2) NOT NULL CHECK (per_transaction_limit >= 0),
  daily_transfer_limit numeric(20,2) NOT NULL CHECK (daily_transfer_limit >= 0),
  monthly_transfer_limit numeric(20,2) NOT NULL CHECK (monthly_transfer_limit >= 0),
  daily_withdrawal_limit numeric(20,2) NOT NULL CHECK (daily_withdrawal_limit >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);
ALTER TABLE public.kyc_tier_limits ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.kyc_tier_limits TO authenticated;
CREATE POLICY "authenticated view KYC limits" ON public.kyc_tier_limits
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage KYC limits" ON public.kyc_tier_limits
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

INSERT INTO public.kyc_tier_limits(tier, per_transaction_limit, daily_transfer_limit, monthly_transfer_limit, daily_withdrawal_limit)
VALUES
  (0, 0, 0, 0, 0),
  (1, 1000, 2500, 10000, 500),
  (2, 10000, 25000, 100000, 10000),
  (3, 100000, 250000, 1000000, 100000)
ON CONFLICT (tier) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_identity_verification()
RETURNS smallint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user uuid := auth.uid();
  _email_verified boolean;
  _phone_verified boolean;
  _tier smallint;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT email_confirmed_at IS NOT NULL, phone_confirmed_at IS NOT NULL
  INTO _email_verified, _phone_verified
  FROM auth.users WHERE id = _user;

  UPDATE public.profiles
  SET email_verified = coalesce(_email_verified, false),
      phone_verified = coalesce(_phone_verified, false),
      kyc_tier = CASE
        WHEN kyc_tier < 1 AND coalesce(_phone_verified, false) AND nullif(trim(full_name), '') IS NOT NULL THEN 1
        ELSE kyc_tier
      END,
      updated_at = now()
  WHERE id = _user
  RETURNING kyc_tier INTO _tier;
  RETURN coalesce(_tier, 0);
END;
$$;
REVOKE ALL ON FUNCTION public.sync_identity_verification() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_identity_verification() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_kyc_limit(_user_id uuid, _amount numeric, _operation text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile public.profiles%ROWTYPE;
  _limits public.kyc_tier_limits%ROWTYPE;
  _daily numeric;
  _monthly numeric;
BEGIN
  SELECT * INTO _profile FROM public.profiles WHERE id = _user_id;
  IF _profile.id IS NULL OR _profile.account_status <> 'active' THEN RAISE EXCEPTION 'Account is not active'; END IF;
  SELECT * INTO _limits FROM public.kyc_tier_limits WHERE tier = _profile.kyc_tier;
  IF _limits.tier IS NULL OR _amount > _limits.per_transaction_limit THEN RAISE EXCEPTION 'KYC tier transaction limit exceeded'; END IF;

  IF _operation = 'transfer' THEN
    SELECT coalesce(sum(amount), 0) INTO _daily FROM public.transactions
    WHERE user_id = _user_id AND type = 'transfer' AND status = 'completed'
      AND created_at >= date_trunc('day', now());
    SELECT coalesce(sum(amount), 0) INTO _monthly FROM public.transactions
    WHERE user_id = _user_id AND type = 'transfer' AND status = 'completed'
      AND created_at >= date_trunc('month', now());
    IF _daily + _amount > _limits.daily_transfer_limit OR _monthly + _amount > _limits.monthly_transfer_limit THEN
      RAISE EXCEPTION 'KYC tier transfer limit exceeded';
    END IF;
  ELSIF _operation = 'withdrawal' THEN
    IF _amount > _limits.daily_withdrawal_limit THEN RAISE EXCEPTION 'KYC tier withdrawal limit exceeded'; END IF;
  ELSIF _operation = 'purchase' THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Unsupported limit operation';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_kyc_limit(uuid, numeric, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_kyc_limit(uuid, numeric, text) TO service_role;

-- Approval advances government ID to Tier 2 and proof of address to Tier 3.
CREATE OR REPLACE FUNCTION public.review_kyc_document(
  _document_id uuid, _approve boolean, _notes text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer uuid := auth.uid();
  _document public.kyc_documents%ROWTYPE;
  _current_tier smallint;
  _next_tier smallint;
BEGIN
  IF _reviewer IS NULL OR NOT (public.has_role(_reviewer, 'admin') OR public.has_role(_reviewer, 'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF NOT _approve AND nullif(trim(_notes), '') IS NULL THEN RAISE EXCEPTION 'Rejection reason is required'; END IF;
  SELECT * INTO _document FROM public.kyc_documents WHERE id = _document_id FOR UPDATE;
  IF _document.id IS NULL THEN RAISE EXCEPTION 'KYC submission not found'; END IF;
  IF _document.status <> 'pending' THEN RAISE EXCEPTION 'KYC submission already reviewed'; END IF;
  SELECT kyc_tier INTO _current_tier FROM public.profiles WHERE id = _document.user_id FOR UPDATE;

  IF _approve THEN
    IF _document.document_type = 'proof_of_address' THEN
      IF _current_tier < 2 THEN RAISE EXCEPTION 'Government ID approval is required first'; END IF;
      _next_tier := 3;
    ELSE
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _document.user_id AND phone_verified) THEN
        RAISE EXCEPTION 'Phone verification is required first';
      END IF;
      _next_tier := greatest(_current_tier, 2);
    END IF;
  ELSE
    _next_tier := _current_tier;
  END IF;

  UPDATE public.kyc_documents SET
    status = CASE WHEN _approve THEN 'approved' ELSE 'rejected' END,
    reviewer_id = _reviewer, reviewer_notes = _notes, reviewed_at = now()
  WHERE id = _document_id;
  UPDATE public.profiles SET
    kyc_status = CASE WHEN _approve THEN 'verified'::public.kyc_status ELSE 'rejected'::public.kyc_status END,
    kyc_tier = _next_tier,
    kyc_approved_at = CASE WHEN _approve THEN now() ELSE kyc_approved_at END,
    updated_at = now()
  WHERE id = _document.user_id;
  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, after_state)
  VALUES (_reviewer, 'kyc_review', 'kyc_document', _document_id::text,
    jsonb_build_object('approved', _approve, 'notes', _notes, 'user_id', _document.user_id, 'tier', _next_tier));
END;
$$;
