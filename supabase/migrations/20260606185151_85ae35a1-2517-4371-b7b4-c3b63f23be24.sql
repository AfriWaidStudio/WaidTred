
-- ============ 1. WaidChat ============
CREATE TABLE public.chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group boolean NOT NULL DEFAULT false,
  title text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.chat_thread_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz,
  UNIQUE(thread_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_thread_participants TO authenticated;
GRANT ALL ON public.chat_thread_participants TO service_role;
ALTER TABLE public.chat_thread_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_thread_participant(_thread_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM chat_thread_participants WHERE thread_id=_thread_id AND user_id=_user_id)
$$;

CREATE POLICY "view threads" ON public.chat_threads FOR SELECT TO authenticated
  USING (is_thread_participant(id, auth.uid()));
CREATE POLICY "create threads" ON public.chat_threads FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "update threads" ON public.chat_threads FOR UPDATE TO authenticated
  USING (is_thread_participant(id, auth.uid()));

CREATE POLICY "view participants" ON public.chat_thread_participants FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_thread_participant(thread_id, auth.uid()));
CREATE POLICY "add participants" ON public.chat_thread_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_thread_participant(thread_id, auth.uid()));
CREATE POLICY "leave thread" ON public.chat_thread_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.chat_thread_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  body text,
  attachment_type text,
  attachment_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_thread_messages TO authenticated;
GRANT ALL ON public.chat_thread_messages TO service_role;
ALTER TABLE public.chat_thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view thread msgs" ON public.chat_thread_messages FOR SELECT TO authenticated
  USING (is_thread_participant(thread_id, auth.uid()));
CREATE POLICY "send thread msg" ON public.chat_thread_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND is_thread_participant(thread_id, auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_thread_messages;
ALTER TABLE public.chat_thread_messages REPLICA IDENTITY FULL;

-- ============ 2. WaidGive (Causes) ============
CREATE TABLE public.causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  goal_amount numeric NOT NULL,
  raised_amount numeric NOT NULL DEFAULT 0,
  organizer_id uuid NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'active',
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.causes TO authenticated;
GRANT SELECT ON public.causes TO anon;
GRANT ALL ON public.causes TO service_role;
ALTER TABLE public.causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view causes" ON public.causes FOR SELECT USING (true);
CREATE POLICY "create cause" ON public.causes FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "update own cause" ON public.causes FOR UPDATE TO authenticated USING (organizer_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cause_id uuid NOT NULL,
  donor_id uuid NOT NULL,
  amount numeric NOT NULL,
  anonymous boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view donations" ON public.donations FOR SELECT TO authenticated USING (true);
CREATE POLICY "make donation" ON public.donations FOR INSERT TO authenticated WITH CHECK (donor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.donate_to_cause(_cause_id uuid, _amount numeric, _anonymous boolean DEFAULT false, _message text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _d uuid; _organizer uuid;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  SELECT organizer_id INTO _organizer FROM causes WHERE id = _cause_id;
  IF _organizer IS NULL THEN RAISE EXCEPTION 'Cause not found'; END IF;
  PERFORM process_wallet_movement(_u, 'debit', _amount, 'donation', 'Donation', 'cause', _cause_id);
  PERFORM process_wallet_movement(_organizer, 'credit', _amount, 'donation_received', 'Donation received', 'cause', _cause_id);
  INSERT INTO donations(cause_id, donor_id, amount, anonymous, message) VALUES (_cause_id, _u, _amount, _anonymous, _message) RETURNING id INTO _d;
  UPDATE causes SET raised_amount = raised_amount + _amount WHERE id = _cause_id;
  RETURN _d;
END $$;

-- ============ 3. WaidEvents ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  cover_url text,
  venue text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  price numeric NOT NULL DEFAULT 0,
  capacity integer,
  tickets_sold integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "create event" ON public.events FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "manage own event" ON public.events FOR UPDATE TO authenticated USING (organizer_id = auth.uid());

CREATE TABLE public.event_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  ticket_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'valid',
  scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.event_tickets TO authenticated;
GRANT ALL ON public.event_tickets TO service_role;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer view ticket" ON public.event_tickets FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR EXISTS(SELECT 1 FROM events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "organizer scan" ON public.event_tickets FOR UPDATE TO authenticated
  USING (EXISTS(SELECT 1 FROM events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "buy ticket" ON public.event_tickets FOR INSERT TO authenticated WITH CHECK (buyer_id = auth.uid());

CREATE OR REPLACE FUNCTION public.buy_event_ticket(_event_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _e events%ROWTYPE; _t uuid; _code text;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  SELECT * INTO _e FROM events WHERE id = _event_id FOR UPDATE;
  IF _e.id IS NULL THEN RAISE EXCEPTION 'Event not found'; END IF;
  IF _e.capacity IS NOT NULL AND _e.tickets_sold >= _e.capacity THEN RAISE EXCEPTION 'Sold out'; END IF;
  IF _e.price > 0 THEN
    PERFORM process_wallet_movement(_u, 'debit', _e.price, 'event_ticket', 'Ticket: ' || _e.title, 'event', _event_id);
    PERFORM process_wallet_movement(_e.organizer_id, 'credit', _e.price, 'event_sale', 'Ticket sale: ' || _e.title, 'event', _event_id);
  END IF;
  _code := 'TKT-' || upper(substring(replace(gen_random_uuid()::text,'-',''), 1, 10));
  INSERT INTO event_tickets(event_id, buyer_id, ticket_code) VALUES (_event_id, _u, _code) RETURNING id INTO _t;
  UPDATE events SET tickets_sold = tickets_sold + 1 WHERE id = _event_id;
  RETURN _t;
END $$;

-- ============ 4. WaidJobs ============
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  budget numeric NOT NULL,
  deadline date,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "post jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (poster_id = auth.uid());
CREATE POLICY "manage own jobs" ON public.jobs FOR UPDATE TO authenticated USING (poster_id = auth.uid() OR assigned_to = auth.uid());

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  applicant_id uuid NOT NULL,
  cover_note text,
  bid_amount numeric,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view apps" ON public.job_applications FOR SELECT TO authenticated
  USING (applicant_id = auth.uid() OR EXISTS(SELECT 1 FROM jobs j WHERE j.id = job_id AND j.poster_id = auth.uid()));
CREATE POLICY "apply jobs" ON public.job_applications FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "respond apps" ON public.job_applications FOR UPDATE TO authenticated
  USING (EXISTS(SELECT 1 FROM jobs j WHERE j.id = job_id AND j.poster_id = auth.uid()));

-- ============ 5. WaidRent ============
CREATE TABLE public.rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  cover_url text,
  daily_rate numeric NOT NULL,
  deposit numeric NOT NULL DEFAULT 0,
  location text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rentals TO authenticated;
GRANT SELECT ON public.rentals TO anon;
GRANT ALL ON public.rentals TO service_role;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view rentals" ON public.rentals FOR SELECT USING (true);
CREATE POLICY "list rental" ON public.rentals FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "manage rental" ON public.rentals FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "delete rental" ON public.rentals FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE TABLE public.rental_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid NOT NULL,
  renter_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.rental_bookings TO authenticated;
GRANT ALL ON public.rental_bookings TO service_role;
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view bookings" ON public.rental_bookings FOR SELECT TO authenticated
  USING (renter_id = auth.uid() OR EXISTS(SELECT 1 FROM rentals r WHERE r.id = rental_id AND r.owner_id = auth.uid()));
CREATE POLICY "book rental" ON public.rental_bookings FOR INSERT TO authenticated WITH CHECK (renter_id = auth.uid());
CREATE POLICY "update booking" ON public.rental_bookings FOR UPDATE TO authenticated
  USING (renter_id = auth.uid() OR EXISTS(SELECT 1 FROM rentals r WHERE r.id = rental_id AND r.owner_id = auth.uid()));

-- ============ 6. SmaiStaking ============
CREATE TABLE public.staking_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  term_days integer NOT NULL,
  apy numeric NOT NULL,
  min_amount numeric NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.staking_plans TO authenticated, anon;
GRANT ALL ON public.staking_plans TO service_role;
ALTER TABLE public.staking_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view plans" ON public.staking_plans FOR SELECT USING (true);
CREATE POLICY "admin plans" ON public.staking_plans FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.staking_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  principal numeric NOT NULL,
  yield_earned numeric NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  matures_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  last_accrued_date date
);
GRANT SELECT, INSERT, UPDATE ON public.staking_positions TO authenticated;
GRANT ALL ON public.staking_positions TO service_role;
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stakes" ON public.staking_positions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.open_staking_position(_plan_id uuid, _amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _p staking_plans%ROWTYPE; _id uuid;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  SELECT * INTO _p FROM staking_plans WHERE id = _plan_id AND is_active;
  IF _p.id IS NULL THEN RAISE EXCEPTION 'Plan unavailable'; END IF;
  IF _amount < _p.min_amount THEN RAISE EXCEPTION 'Below minimum'; END IF;
  PERFORM process_wallet_movement(_u, 'debit', _amount, 'stake_open', 'Stake: ' || _p.name, 'staking_plan', _plan_id);
  INSERT INTO staking_positions(user_id, plan_id, principal, matures_at, last_accrued_date)
  VALUES (_u, _plan_id, _amount, now() + (_p.term_days || ' days')::interval, CURRENT_DATE) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- ============ 7. WaidPredict ============
CREATE TABLE public.prediction_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  description text,
  category text,
  closes_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open',
  resolution text,
  yes_pool numeric NOT NULL DEFAULT 0,
  no_pool numeric NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.prediction_markets TO authenticated;
GRANT SELECT ON public.prediction_markets TO anon;
GRANT ALL ON public.prediction_markets TO service_role;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view markets" ON public.prediction_markets FOR SELECT USING (true);
CREATE POLICY "create market" ON public.prediction_markets FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "resolve market" ON public.prediction_markets FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TABLE public.prediction_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL,
  user_id uuid NOT NULL,
  side text NOT NULL CHECK (side IN ('yes','no')),
  amount numeric NOT NULL,
  payout numeric NOT NULL DEFAULT 0,
  settled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prediction_positions TO authenticated;
GRANT ALL ON public.prediction_positions TO service_role;
ALTER TABLE public.prediction_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own positions" ON public.prediction_positions FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "stake position" ON public.prediction_positions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.predict_stake(_market_id uuid, _side text, _amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _m prediction_markets%ROWTYPE; _id uuid;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  SELECT * INTO _m FROM prediction_markets WHERE id = _market_id FOR UPDATE;
  IF _m.status <> 'open' OR _m.closes_at <= now() THEN RAISE EXCEPTION 'Market closed'; END IF;
  PERFORM process_wallet_movement(_u, 'debit', _amount, 'predict_stake', 'Predict: ' || _m.question, 'prediction', _market_id);
  INSERT INTO prediction_positions(market_id, user_id, side, amount) VALUES (_market_id, _u, _side, _amount) RETURNING id INTO _id;
  IF _side = 'yes' THEN UPDATE prediction_markets SET yes_pool = yes_pool + _amount WHERE id = _market_id;
  ELSE UPDATE prediction_markets SET no_pool = no_pool + _amount WHERE id = _market_id; END IF;
  RETURN _id;
END $$;

-- ============ 8. Expense Groups ============
CREATE TABLE public.expense_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_groups TO authenticated;
GRANT ALL ON public.expense_groups TO service_role;
ALTER TABLE public.expense_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.expense_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.expense_group_members TO authenticated;
GRANT ALL ON public.expense_group_members TO service_role;
ALTER TABLE public.expense_group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_expense_member(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM expense_group_members WHERE group_id=_group_id AND user_id=_user_id)
$$;

CREATE POLICY "view expense group" ON public.expense_groups FOR SELECT TO authenticated USING (created_by = auth.uid() OR is_expense_member(id, auth.uid()));
CREATE POLICY "create expense group" ON public.expense_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "update expense group" ON public.expense_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "view expense members" ON public.expense_group_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_expense_member(group_id, auth.uid()));
CREATE POLICY "add expense member" ON public.expense_group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR is_expense_member(group_id, auth.uid()));
CREATE POLICY "leave expense group" ON public.expense_group_members FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.expense_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  paid_by uuid NOT NULL,
  amount numeric NOT NULL,
  description text,
  split_among uuid[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.expense_entries TO authenticated;
GRANT ALL ON public.expense_entries TO service_role;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view entries" ON public.expense_entries FOR SELECT TO authenticated USING (is_expense_member(group_id, auth.uid()));
CREATE POLICY "add entry" ON public.expense_entries FOR INSERT TO authenticated WITH CHECK (paid_by = auth.uid() AND is_expense_member(group_id, auth.uid()));
CREATE POLICY "delete own entry" ON public.expense_entries FOR DELETE TO authenticated USING (paid_by = auth.uid());

-- ============ 9. Recovery Contacts ============
CREATE TABLE public.recovery_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_user_id uuid,
  contact_name text NOT NULL,
  contact_email text,
  contact_phone text,
  relationship text,
  is_heir boolean NOT NULL DEFAULT false,
  inheritance_share numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recovery_contacts TO authenticated;
GRANT ALL ON public.recovery_contacts TO service_role;
ALTER TABLE public.recovery_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recovery" ON public.recovery_contacts FOR ALL TO authenticated USING (user_id = auth.uid() OR contact_user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  approvals_needed integer NOT NULL DEFAULT 2,
  approvals_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.recovery_requests TO authenticated;
GRANT ALL ON public.recovery_requests TO service_role;
ALTER TABLE public.recovery_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own recovery req" ON public.recovery_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS(SELECT 1 FROM recovery_contacts rc WHERE rc.user_id = recovery_requests.user_id AND rc.contact_user_id = auth.uid()));
CREATE POLICY "request recovery" ON public.recovery_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "approve recovery" ON public.recovery_requests FOR UPDATE TO authenticated
  USING (EXISTS(SELECT 1 FROM recovery_contacts rc WHERE rc.user_id = recovery_requests.user_id AND rc.contact_user_id = auth.uid()));

-- ============ 10. Voice Commands ============
CREATE TABLE public.voice_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  audio_url text,
  transcript text,
  intent text,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.voice_commands TO authenticated;
GRANT ALL ON public.voice_commands TO service_role;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own voice" ON public.voice_commands FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ Staking accrual function ============
CREATE OR REPLACE FUNCTION public.process_staking_accrual()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p RECORD; _daily numeric; _count int := 0;
BEGIN
  FOR _p IN
    SELECT sp.*, pl.apy FROM staking_positions sp
    JOIN staking_plans pl ON pl.id = sp.plan_id
    WHERE sp.status='active' AND (sp.last_accrued_date IS NULL OR sp.last_accrued_date < CURRENT_DATE)
  LOOP
    _daily := _p.principal * (_p.apy/100.0) / 365.0;
    UPDATE staking_positions SET yield_earned = yield_earned + _daily, last_accrued_date = CURRENT_DATE WHERE id = _p.id;
    PERFORM process_wallet_movement(_p.user_id, 'credit', _daily, 'stake_yield', 'Staking yield', 'staking_position', _p.id);
    IF now() >= _p.matures_at THEN
      PERFORM process_wallet_movement(_p.user_id, 'credit', _p.principal, 'stake_mature', 'Stake matured', 'staking_position', _p.id);
      UPDATE staking_positions SET status='matured' WHERE id = _p.id;
    END IF;
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END $$;

-- Seed staking plans
INSERT INTO staking_plans(name, term_days, apy, min_amount) VALUES
  ('Flexi 30', 30, 5, 100),
  ('Steady 90', 90, 8, 500),
  ('Power 180', 180, 12, 1000),
  ('Pro 365', 365, 18, 5000);
