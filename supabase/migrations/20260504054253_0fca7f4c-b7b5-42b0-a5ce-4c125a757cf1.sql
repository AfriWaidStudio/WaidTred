
-- ============ WALLET LEDGER (immutable) ============
CREATE TABLE public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  balance_after NUMERIC NOT NULL,
  category TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ledger_user ON public.wallet_ledger(user_id, created_at DESC);
CREATE INDEX idx_ledger_wallet ON public.wallet_ledger(wallet_id, created_at DESC);
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ledger" ON public.wallet_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all ledger" ON public.wallet_ledger FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

-- ============ WALLET LOCKS (WaidLock) ============
CREATE TABLE public.wallet_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  daily_release NUMERIC NOT NULL CHECK (daily_release > 0),
  released_amount NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_release_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_locks_user ON public.wallet_locks(user_id);
ALTER TABLE public.wallet_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own locks" ON public.wallet_locks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins view all locks" ON public.wallet_locks FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TABLE public.wallet_lock_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lock_id UUID NOT NULL REFERENCES public.wallet_locks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  released_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_releases_lock ON public.wallet_lock_releases(lock_id, released_at DESC);
ALTER TABLE public.wallet_lock_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own releases" ON public.wallet_lock_releases FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON public.notifications(user_id, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications" ON public.notifications FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'));

-- ============ KYC DOCUMENTS ============
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT,
  document_number TEXT,
  full_name TEXT,
  date_of_birth DATE,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewer_id UUID,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kyc_user ON public.kyc_documents(user_id);
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own kyc" ON public.kyc_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own kyc" ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins manage kyc" ON public.kyc_documents FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'));

-- ============ CONTACTS ============
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_user_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_user ON public.contacts(user_id);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contacts" ON public.contacts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ FUNDING REQUESTS ============
CREATE TABLE public.funding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  proof_url TEXT,
  reference_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  agent_id UUID,
  agent_notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_funding_user ON public.funding_requests(user_id, created_at DESC);
CREATE INDEX idx_funding_status ON public.funding_requests(status);
ALTER TABLE public.funding_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own funding" ON public.funding_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own funding" ON public.funding_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Agents view all funding" ON public.funding_requests FOR SELECT TO authenticated USING (has_role(auth.uid(),'agent') OR has_role(auth.uid(),'admin'));
CREATE POLICY "Agents update funding" ON public.funding_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(),'agent') OR has_role(auth.uid(),'admin'));

-- ============ SCHEDULED TRANSFERS ============
CREATE TABLE public.scheduled_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_user_id UUID,
  recipient_phone TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
  next_run DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sched_user ON public.scheduled_transfers(user_id);
ALTER TABLE public.scheduled_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own schedules" ON public.scheduled_transfers FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ REFERRALS ============
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID,
  referral_code TEXT NOT NULL,
  referred_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','joined','rewarded')),
  reward_amount NUMERIC DEFAULT 0,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ref_referrer ON public.referrals(referrer_id);
CREATE UNIQUE INDEX idx_ref_code ON public.referrals(referral_code);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Users create own referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());

-- ============ HELPER: ensure wallet exists ============
CREATE OR REPLACE FUNCTION public.ensure_wallet(_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _wid UUID;
BEGIN
  SELECT id INTO _wid FROM wallets WHERE user_id = _user_id AND currency_type = 'SMAI_SIKA' LIMIT 1;
  IF _wid IS NULL THEN
    INSERT INTO wallets(user_id, currency_type, total_balance, available_balance, locked_balance)
    VALUES (_user_id, 'SMAI_SIKA', 0, 0, 0) RETURNING id INTO _wid;
  END IF;
  RETURN _wid;
END $$;

-- ============ FN: process_wallet_movement ============
CREATE OR REPLACE FUNCTION public.process_wallet_movement(
  _user_id UUID, _direction TEXT, _amount NUMERIC,
  _category TEXT, _description TEXT DEFAULT NULL,
  _reference_type TEXT DEFAULT NULL, _reference_id UUID DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _wid UUID; _new_avail NUMERIC; _new_total NUMERIC; _ledger_id UUID;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  _wid := ensure_wallet(_user_id);
  IF _direction = 'debit' THEN
    UPDATE wallets SET available_balance = available_balance - _amount,
      total_balance = total_balance - _amount, last_updated = now()
      WHERE id = _wid AND available_balance >= _amount
      RETURNING available_balance, total_balance INTO _new_avail, _new_total;
    IF _new_avail IS NULL THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  ELSIF _direction = 'credit' THEN
    UPDATE wallets SET available_balance = available_balance + _amount,
      total_balance = total_balance + _amount, last_updated = now()
      WHERE id = _wid RETURNING available_balance, total_balance INTO _new_avail, _new_total;
  ELSE RAISE EXCEPTION 'Invalid direction'; END IF;
  INSERT INTO wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
    VALUES (_wid, _user_id, _direction, _amount, _new_total, _category, _reference_type, _reference_id, _description)
    RETURNING id INTO _ledger_id;
  RETURN _ledger_id;
END $$;

-- ============ FN: send_money ============
CREATE OR REPLACE FUNCTION public.send_money(
  _recipient_id UUID, _amount NUMERIC, _description TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _sender UUID; _tx UUID; _recipient_name TEXT;
BEGIN
  _sender := auth.uid();
  IF _sender IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _sender = _recipient_id THEN RAISE EXCEPTION 'Cannot send to self'; END IF;
  PERFORM ensure_wallet(_recipient_id);
  SELECT full_name INTO _recipient_name FROM profiles WHERE id = _recipient_id;
  INSERT INTO transactions(user_id, type, title, description, amount, currency, recipient, status)
    VALUES (_sender, 'send', 'Transfer to ' || COALESCE(_recipient_name,'user'), _description, _amount, 'SMK', _recipient_name, 'completed')
    RETURNING id INTO _tx;
  PERFORM process_wallet_movement(_sender, 'debit', _amount, 'transfer_out', _description, 'transaction', _tx);
  PERFORM process_wallet_movement(_recipient_id, 'credit', _amount, 'transfer_in', _description, 'transaction', _tx);
  INSERT INTO notifications(user_id, type, title, body, link)
    VALUES (_recipient_id, 'tx', 'Money received', 'You received ' || _amount || ' Smai Sika', '/transactions');
  RETURN _tx;
END $$;

-- ============ FN: confirm_funding ============
CREATE OR REPLACE FUNCTION public.confirm_funding(
  _request_id UUID, _approve BOOLEAN, _notes TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _agent UUID; _req funding_requests%ROWTYPE;
BEGIN
  _agent := auth.uid();
  IF NOT (has_role(_agent,'agent') OR has_role(_agent,'admin')) THEN
    RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO _req FROM funding_requests WHERE id = _request_id FOR UPDATE;
  IF _req.status <> 'pending' THEN RAISE EXCEPTION 'Already processed'; END IF;
  IF _approve THEN
    PERFORM process_wallet_movement(_req.user_id, 'credit', _req.amount, 'funding', 'Wallet top-up', 'funding_request', _request_id);
    UPDATE funding_requests SET status='approved', agent_id=_agent, agent_notes=_notes, processed_at=now() WHERE id=_request_id;
    INSERT INTO notifications(user_id, type, title, body, link)
      VALUES (_req.user_id, 'tx', 'Wallet funded', _req.amount || ' Smai Sika credited', '/transactions');
  ELSE
    UPDATE funding_requests SET status='rejected', agent_id=_agent, agent_notes=_notes, processed_at=now() WHERE id=_request_id;
    INSERT INTO notifications(user_id, type, title, body)
      VALUES (_req.user_id, 'security', 'Funding rejected', COALESCE(_notes,'See agent notes'));
  END IF;
END $$;

-- ============ FN: create_wallet_lock ============
CREATE OR REPLACE FUNCTION public.create_wallet_lock(
  _name TEXT, _total NUMERIC, _daily NUMERIC
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user UUID; _wid UUID; _lock UUID;
BEGIN
  _user := auth.uid();
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _total <= 0 OR _daily <= 0 OR _daily > _total THEN RAISE EXCEPTION 'Invalid amounts'; END IF;
  _wid := ensure_wallet(_user);
  UPDATE wallets SET available_balance = available_balance - _total,
    locked_balance = locked_balance + _total, last_updated = now()
    WHERE id = _wid AND available_balance >= _total;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  INSERT INTO wallet_locks(user_id, wallet_id, name, total_amount, daily_release)
    VALUES (_user, _wid, _name, _total, _daily) RETURNING id INTO _lock;
  INSERT INTO wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
    SELECT _wid, _user, 'debit', _total, total_balance, 'lock_create', 'wallet_lock', _lock, 'Locked: ' || _name FROM wallets WHERE id = _wid;
  RETURN _lock;
END $$;

-- ============ FN: process_drip_releases ============
CREATE OR REPLACE FUNCTION public.process_drip_releases() 
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _lock RECORD; _release NUMERIC; _count INT := 0;
BEGIN
  FOR _lock IN SELECT * FROM wallet_locks
    WHERE status='active' AND (last_release_date IS NULL OR last_release_date < CURRENT_DATE) AND start_date <= CURRENT_DATE
  LOOP
    _release := LEAST(_lock.daily_release, _lock.total_amount - _lock.released_amount);
    IF _release <= 0 THEN
      UPDATE wallet_locks SET status='completed' WHERE id = _lock.id; CONTINUE;
    END IF;
    UPDATE wallets SET available_balance = available_balance + _release,
      locked_balance = locked_balance - _release, last_updated = now() WHERE id = _lock.wallet_id;
    UPDATE wallet_locks SET released_amount = released_amount + _release,
      last_release_date = CURRENT_DATE,
      status = CASE WHEN released_amount + _release >= total_amount THEN 'completed' ELSE 'active' END
      WHERE id = _lock.id;
    INSERT INTO wallet_lock_releases(lock_id, user_id, amount) VALUES (_lock.id, _lock.user_id, _release);
    INSERT INTO wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
      SELECT _lock.wallet_id, _lock.user_id, 'credit', _release, total_balance, 'lock_release', 'wallet_lock', _lock.id, 'Drip release: ' || _lock.name FROM wallets WHERE id = _lock.wallet_id;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END $$;

-- Auto-create wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  INSERT INTO public.wallets (user_id, currency_type, total_balance, available_balance, locked_balance)
  VALUES (NEW.id, 'SMAI_SIKA', 0, 0, 0);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow users to insert their own role row (needed by trigger fallback)
CREATE POLICY "Users insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role = 'user');
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
