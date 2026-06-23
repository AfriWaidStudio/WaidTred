
-- ============================================================
-- KONSMIK CIVILIZATION CORE — PHASE 1
-- ============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.entity_kind AS ENUM ('konsmik_core','tredbeing','smaibeing','family','cooperative','merchant','government','community');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tredbeing_kind AS ENUM ('saving','investment','trading','merchant');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cooperative_kind AS ENUM ('village','association','school','church','community','cooperative');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.family_role AS ENUM ('head','parent','child','guardian','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.coop_role AS ENUM ('admin','treasurer','member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. ONYIX CORE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.onyix_reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL DEFAULT 'ONYIX',
  total_supply NUMERIC NOT NULL DEFAULT 0,
  circulating NUMERIC NOT NULL DEFAULT 0,
  allocated NUMERIC NOT NULL DEFAULT 0,
  burned NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.onyix_reserves TO authenticated, anon;
GRANT ALL ON public.onyix_reserves TO service_role;
ALTER TABLE public.onyix_reserves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onyix_reserves_read" ON public.onyix_reserves FOR SELECT USING (true);
CREATE POLICY "onyix_reserves_admin_write" ON public.onyix_reserves FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE IF NOT EXISTS public.onyix_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reserve_id UUID NOT NULL REFERENCES public.onyix_reserves(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create','allocate','consume','burn','transfer')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  entity_id UUID,
  actor_id UUID,
  reason TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.onyix_movements TO authenticated;
GRANT ALL ON public.onyix_movements TO service_role;
ALTER TABLE public.onyix_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onyix_movements_read" ON public.onyix_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "onyix_movements_admin_write" ON public.onyix_movements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_onyix_mov_reserve ON public.onyix_movements(reserve_id, created_at DESC);

-- ============================================================
-- 2. KONSMIK ENTITIES + TREASURIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.konsmik_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kind public.entity_kind NOT NULL,
  owner_id UUID,
  parent_entity_id UUID REFERENCES public.konsmik_entities(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_core BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.konsmik_entities TO authenticated, anon;
GRANT INSERT, UPDATE ON public.konsmik_entities TO authenticated;
GRANT ALL ON public.konsmik_entities TO service_role;
ALTER TABLE public.konsmik_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entities_read" ON public.konsmik_entities FOR SELECT USING (true);
CREATE POLICY "entities_owner_insert" ON public.konsmik_entities FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id AND NOT is_core);
CREATE POLICY "entities_owner_update" ON public.konsmik_entities FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.entity_treasuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL UNIQUE REFERENCES public.konsmik_entities(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  reserve_allocation NUMERIC NOT NULL DEFAULT 0,
  revenue_total NUMERIC NOT NULL DEFAULT 0,
  expense_total NUMERIC NOT NULL DEFAULT 0,
  budget_monthly NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entity_treasuries TO authenticated;
GRANT ALL ON public.entity_treasuries TO service_role;
ALTER TABLE public.entity_treasuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treasuries_read" ON public.entity_treasuries FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.konsmik_entities e WHERE e.id = entity_id AND (e.owner_id = auth.uid() OR e.is_core))
  OR public.has_role(auth.uid(),'admin')
);

CREATE TABLE IF NOT EXISTS public.entity_treasury_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.konsmik_entities(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('credit','debit')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  actor_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.entity_treasury_movements TO authenticated;
GRANT ALL ON public.entity_treasury_movements TO service_role;
ALTER TABLE public.entity_treasury_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "treasury_mov_read" ON public.entity_treasury_movements FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.konsmik_entities e WHERE e.id = entity_id AND (e.owner_id = auth.uid() OR e.is_core))
  OR public.has_role(auth.uid(),'admin')
);
CREATE INDEX IF NOT EXISTS idx_etm_entity ON public.entity_treasury_movements(entity_id, created_at DESC);

-- ============================================================
-- 3. TREDBEINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tredbeings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entity_id UUID NOT NULL UNIQUE REFERENCES public.konsmik_entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind public.tredbeing_kind NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tredbeings TO authenticated;
GRANT ALL ON public.tredbeings TO service_role;
ALTER TABLE public.tredbeings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tredbeings_owner" ON public.tredbeings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. FAMILIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  head_id UUID NOT NULL,
  entity_id UUID UNIQUE REFERENCES public.konsmik_entities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.family_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_family_member(_family_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM family_members WHERE family_id=_family_id AND user_id=_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_family_head(_family_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM families WHERE id=_family_id AND head_id=_user_id)
$$;

CREATE POLICY "families_read" ON public.families FOR SELECT TO authenticated
  USING (public.is_family_member(id, auth.uid()) OR head_id = auth.uid());
CREATE POLICY "families_insert" ON public.families FOR INSERT TO authenticated
  WITH CHECK (head_id = auth.uid());
CREATE POLICY "families_update" ON public.families FOR UPDATE TO authenticated
  USING (head_id = auth.uid()) WITH CHECK (head_id = auth.uid());

CREATE POLICY "fmembers_read" ON public.family_members FOR SELECT TO authenticated
  USING (public.is_family_member(family_id, auth.uid()));
CREATE POLICY "fmembers_head_manage" ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (public.is_family_head(family_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "fmembers_head_delete" ON public.family_members FOR DELETE TO authenticated
  USING (public.is_family_head(family_id, auth.uid()) OR user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.family_treasuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL UNIQUE REFERENCES public.families(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  shared_savings NUMERIC NOT NULL DEFAULT 0,
  shared_insurance NUMERIC NOT NULL DEFAULT 0,
  shared_investments NUMERIC NOT NULL DEFAULT 0,
  rules JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.family_treasuries TO authenticated;
GRANT ALL ON public.family_treasuries TO service_role;
ALTER TABLE public.family_treasuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ftreasury_read" ON public.family_treasuries FOR SELECT TO authenticated
  USING (public.is_family_member(family_id, auth.uid()));
CREATE POLICY "ftreasury_head_update" ON public.family_treasuries FOR UPDATE TO authenticated
  USING (public.is_family_head(family_id, auth.uid())) WITH CHECK (public.is_family_head(family_id, auth.uid()));

-- ============================================================
-- 5. COOPERATIVES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind public.cooperative_kind NOT NULL,
  founder_id UUID NOT NULL,
  entity_id UUID UNIQUE REFERENCES public.konsmik_entities(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cooperatives TO authenticated;
GRANT ALL ON public.cooperatives TO service_role;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coops_read" ON public.cooperatives FOR SELECT USING (true);
CREATE POLICY "coops_insert" ON public.cooperatives FOR INSERT TO authenticated
  WITH CHECK (founder_id = auth.uid());
CREATE POLICY "coops_founder_update" ON public.cooperatives FOR UPDATE TO authenticated
  USING (founder_id = auth.uid()) WITH CHECK (founder_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.cooperative_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coop_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.coop_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coop_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.cooperative_members TO authenticated;
GRANT ALL ON public.cooperative_members TO service_role;
ALTER TABLE public.cooperative_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_coop_member(_coop_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM cooperative_members WHERE coop_id=_coop_id AND user_id=_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_coop_admin(_coop_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM cooperative_members WHERE coop_id=_coop_id AND user_id=_user_id AND role IN ('admin','treasurer'))
    OR EXISTS(SELECT 1 FROM cooperatives WHERE id=_coop_id AND founder_id=_user_id)
$$;

CREATE POLICY "cmembers_read" ON public.cooperative_members FOR SELECT USING (true);
CREATE POLICY "cmembers_self_join" ON public.cooperative_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_coop_admin(coop_id, auth.uid()));
CREATE POLICY "cmembers_leave" ON public.cooperative_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_coop_admin(coop_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.cooperative_treasuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coop_id UUID NOT NULL UNIQUE REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  total_contributions NUMERIC NOT NULL DEFAULT 0,
  total_disbursed NUMERIC NOT NULL DEFAULT 0,
  governance JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.cooperative_treasuries TO authenticated;
GRANT ALL ON public.cooperative_treasuries TO service_role;
ALTER TABLE public.cooperative_treasuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ctreasury_read" ON public.cooperative_treasuries FOR SELECT USING (true);
CREATE POLICY "ctreasury_admin_update" ON public.cooperative_treasuries FOR UPDATE TO authenticated
  USING (public.is_coop_admin(coop_id, auth.uid())) WITH CHECK (public.is_coop_admin(coop_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.cooperative_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coop_id UUID NOT NULL REFERENCES public.cooperatives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','executed')),
  closes_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cooperative_votes TO authenticated;
GRANT ALL ON public.cooperative_votes TO service_role;
ALTER TABLE public.cooperative_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cvotes_read" ON public.cooperative_votes FOR SELECT TO authenticated
  USING (public.is_coop_member(coop_id, auth.uid()));
CREATE POLICY "cvotes_admin_create" ON public.cooperative_votes FOR INSERT TO authenticated
  WITH CHECK (public.is_coop_admin(coop_id, auth.uid()) AND created_by = auth.uid());

CREATE TABLE IF NOT EXISTS public.cooperative_vote_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.cooperative_votes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  choice TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vote_id, user_id)
);
GRANT SELECT, INSERT ON public.cooperative_vote_choices TO authenticated;
GRANT ALL ON public.cooperative_vote_choices TO service_role;
ALTER TABLE public.cooperative_vote_choices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cvc_read" ON public.cooperative_vote_choices FOR SELECT TO authenticated USING (true);
CREATE POLICY "cvc_self_vote" ON public.cooperative_vote_choices FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. UNIVERSAL PROSPERITY POOL
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prosperity_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC NOT NULL DEFAULT 0,
  total_contributed NUMERIC NOT NULL DEFAULT 0,
  total_disbursed NUMERIC NOT NULL DEFAULT 0,
  rules JSONB DEFAULT '{"emergency_max":1000,"community_max":5000}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prosperity_pool TO authenticated, anon;
GRANT ALL ON public.prosperity_pool TO service_role;
ALTER TABLE public.prosperity_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pool_read" ON public.prosperity_pool FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.prosperity_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  recipient_kind TEXT NOT NULL CHECK (recipient_kind IN ('user','family','cooperative')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('emergency','community','poverty','education','health')),
  reason TEXT,
  approved_by UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','disbursed','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prosperity_allocations TO authenticated;
GRANT ALL ON public.prosperity_allocations TO service_role;
ALTER TABLE public.prosperity_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "palloc_read" ON public.prosperity_allocations FOR SELECT TO authenticated
  USING (recipient_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "palloc_request" ON public.prosperity_allocations FOR INSERT TO authenticated
  WITH CHECK (recipient_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 7. ECONOMIC MISSION MARKETPLACE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.economic_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward NUMERIC NOT NULL CHECK (reward > 0),
  category TEXT NOT NULL,
  verification_type TEXT NOT NULL DEFAULT 'manual' CHECK (verification_type IN ('manual','auto','community')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','completed')),
  max_claims INT DEFAULT 1,
  claims_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.economic_missions TO authenticated;
GRANT ALL ON public.economic_missions TO service_role;
ALTER TABLE public.economic_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emissions_read" ON public.economic_missions FOR SELECT USING (true);
CREATE POLICY "emissions_create" ON public.economic_missions FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());
CREATE POLICY "emissions_creator_update" ON public.economic_missions FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (creator_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.mission_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.economic_missions(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL,
  proof JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','paid')),
  verified_by UUID,
  paid_amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.mission_claims TO authenticated;
GRANT ALL ON public.mission_claims TO service_role;
ALTER TABLE public.mission_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mclaims_read" ON public.mission_claims FOR SELECT TO authenticated
  USING (claimant_id = auth.uid() 
         OR EXISTS(SELECT 1 FROM economic_missions WHERE id = mission_id AND creator_id = auth.uid())
         OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "mclaims_create" ON public.mission_claims FOR INSERT TO authenticated
  WITH CHECK (claimant_id = auth.uid());

-- ============================================================
-- 8. REPUTATION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reputation_scores (
  user_id UUID PRIMARY KEY,
  trust NUMERIC NOT NULL DEFAULT 50,
  contributions NUMERIC NOT NULL DEFAULT 0,
  reliability NUMERIC NOT NULL DEFAULT 50,
  discipline NUMERIC NOT NULL DEFAULT 50,
  participation NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 50,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reputation_scores TO authenticated;
GRANT ALL ON public.reputation_scores TO service_role;
ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep_read" ON public.reputation_scores FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension TEXT NOT NULL CHECK (dimension IN ('trust','contributions','reliability','discipline','participation')),
  delta NUMERIC NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reputation_events TO authenticated;
GRANT ALL ON public.reputation_events TO service_role;
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repev_read" ON public.reputation_events FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 9. WAIDESPRUF PROOFS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.waidespruf_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type TEXT NOT NULL,
  subject_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  proof_hash TEXT NOT NULL,
  payload JSONB NOT NULL,
  issued_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.waidespruf_proofs TO authenticated;
GRANT ALL ON public.waidespruf_proofs TO service_role;
ALTER TABLE public.waidespruf_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proofs_read" ON public.waidespruf_proofs FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR issued_to = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_proofs_subject ON public.waidespruf_proofs(subject_type, subject_id);

-- ============================================================
-- 10. KONSNET EDGES (entity relationship graph)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.konsnet_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity UUID NOT NULL REFERENCES public.konsmik_entities(id) ON DELETE CASCADE,
  to_entity UUID NOT NULL REFERENCES public.konsmik_entities(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  weight NUMERIC DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.konsnet_edges TO authenticated, anon;
GRANT ALL ON public.konsnet_edges TO service_role;
ALTER TABLE public.konsnet_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "edges_read" ON public.konsnet_edges FOR SELECT USING (true);

-- ============================================================
-- 11. CIVILIZATION METRICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.civilization_metrics_daily (
  snapshot_date DATE PRIMARY KEY,
  total_users INT NOT NULL DEFAULT 0,
  total_entities INT NOT NULL DEFAULT 0,
  total_treasuries INT NOT NULL DEFAULT 0,
  total_transactions INT NOT NULL DEFAULT 0,
  total_onyix NUMERIC NOT NULL DEFAULT 0,
  total_smaisika NUMERIC NOT NULL DEFAULT 0,
  total_maiki NUMERIC NOT NULL DEFAULT 0,
  active_tredbeings INT NOT NULL DEFAULT 0,
  active_smaibeings INT NOT NULL DEFAULT 0,
  economic_growth NUMERIC NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.civilization_metrics_daily TO authenticated, anon;
GRANT ALL ON public.civilization_metrics_daily TO service_role;
ALTER TABLE public.civilization_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_read" ON public.civilization_metrics_daily FOR SELECT USING (true);

-- ============================================================
-- CORE FUNCTIONS
-- ============================================================

-- Allocate onyix to entity
CREATE OR REPLACE FUNCTION public.onyix_allocate(_reserve_id uuid, _entity_id uuid, _amount numeric, _reason text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE onyix_reserves SET allocated = allocated + _amount, circulating = circulating + _amount, updated_at = now()
    WHERE id = _reserve_id AND (total_supply - allocated - burned) >= _amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient reserve'; END IF;
  UPDATE entity_treasuries SET reserve_allocation = reserve_allocation + _amount, updated_at = now() WHERE entity_id = _entity_id;
  INSERT INTO onyix_movements(reserve_id, action, amount, entity_id, actor_id, reason)
    VALUES (_reserve_id, 'allocate', _amount, _entity_id, auth.uid(), _reason) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Consume onyix
CREATE OR REPLACE FUNCTION public.onyix_consume(_reserve_id uuid, _entity_id uuid, _amount numeric, _reason text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  UPDATE onyix_reserves SET circulating = circulating - _amount, updated_at = now()
    WHERE id = _reserve_id AND circulating >= _amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient circulating'; END IF;
  UPDATE entity_treasuries SET reserve_allocation = GREATEST(reserve_allocation - _amount, 0), updated_at = now() WHERE entity_id = _entity_id;
  INSERT INTO onyix_movements(reserve_id, action, amount, entity_id, actor_id, reason)
    VALUES (_reserve_id, 'consume', _amount, _entity_id, auth.uid(), _reason) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Burn onyix
CREATE OR REPLACE FUNCTION public.onyix_burn(_reserve_id uuid, _amount numeric, _reason text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE onyix_reserves SET burned = burned + _amount, total_supply = total_supply - _amount, updated_at = now()
    WHERE id = _reserve_id AND (total_supply - allocated - burned) >= _amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient unallocated'; END IF;
  INSERT INTO onyix_movements(reserve_id, action, amount, actor_id, reason)
    VALUES (_reserve_id, 'burn', _amount, auth.uid(), _reason) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Entity treasury movement
CREATE OR REPLACE FUNCTION public.entity_treasury_move(_entity_id uuid, _direction text, _amount numeric, _category text, _description text DEFAULT NULL, _ref_type text DEFAULT NULL, _ref_id uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;
  IF _direction = 'credit' THEN
    UPDATE entity_treasuries SET balance = balance + _amount, revenue_total = revenue_total + _amount, updated_at = now() WHERE entity_id = _entity_id;
  ELSIF _direction = 'debit' THEN
    UPDATE entity_treasuries SET balance = balance - _amount, expense_total = expense_total + _amount, updated_at = now() WHERE entity_id = _entity_id AND balance >= _amount;
    IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient treasury balance'; END IF;
  ELSE RAISE EXCEPTION 'Invalid direction'; END IF;
  INSERT INTO entity_treasury_movements(entity_id, direction, amount, category, reference_type, reference_id, actor_id, description)
    VALUES (_entity_id, _direction, _amount, _category, _ref_type, _ref_id, auth.uid(), _description) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Create TredBeing
CREATE OR REPLACE FUNCTION public.create_tredbeing(_name text, _kind tredbeing_kind, _goals jsonb DEFAULT '[]'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _entity_id uuid; _tb_id uuid; _slug text;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  _slug := 'tb-' || substring(replace(gen_random_uuid()::text,'-',''),1,12);
  INSERT INTO konsmik_entities(name, slug, kind, owner_id, description)
    VALUES (_name, _slug, 'tredbeing', _u, 'TredBeing: ' || _kind::text)
    RETURNING id INTO _entity_id;
  INSERT INTO entity_treasuries(entity_id) VALUES (_entity_id);
  INSERT INTO tredbeings(user_id, entity_id, name, kind, goals)
    VALUES (_u, _entity_id, _name, _kind, _goals) RETURNING id INTO _tb_id;
  RETURN _tb_id;
END $$;

-- Family contribute
CREATE OR REPLACE FUNCTION public.family_contribute(_family_id uuid, _amount numeric, _category text DEFAULT 'savings')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid();
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  IF NOT is_family_member(_family_id, _u) THEN RAISE EXCEPTION 'Not a family member'; END IF;
  PERFORM process_wallet_movement(_u, 'debit', _amount, 'family_contribution', 'Family contribution', 'family', _family_id);
  UPDATE family_treasuries SET 
    balance = balance + _amount,
    shared_savings = CASE WHEN _category = 'savings' THEN shared_savings + _amount ELSE shared_savings END,
    shared_insurance = CASE WHEN _category = 'insurance' THEN shared_insurance + _amount ELSE shared_insurance END,
    shared_investments = CASE WHEN _category = 'investments' THEN shared_investments + _amount ELSE shared_investments END,
    updated_at = now()
    WHERE family_id = _family_id;
END $$;

-- Cooperative contribute
CREATE OR REPLACE FUNCTION public.cooperative_contribute(_coop_id uuid, _amount numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid();
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  IF NOT is_coop_member(_coop_id, _u) THEN RAISE EXCEPTION 'Not a member'; END IF;
  PERFORM process_wallet_movement(_u, 'debit', _amount, 'coop_contribution', 'Cooperative contribution', 'cooperative', _coop_id);
  UPDATE cooperative_treasuries SET balance = balance + _amount, total_contributions = total_contributions + _amount, updated_at = now() WHERE coop_id = _coop_id;
END $$;

-- Claim mission
CREATE OR REPLACE FUNCTION public.claim_mission(_mission_id uuid, _proof jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _id uuid; _m economic_missions%ROWTYPE;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  SELECT * INTO _m FROM economic_missions WHERE id = _mission_id FOR UPDATE;
  IF _m.status <> 'open' THEN RAISE EXCEPTION 'Mission not open'; END IF;
  IF _m.claims_count >= _m.max_claims THEN RAISE EXCEPTION 'No claims left'; END IF;
  INSERT INTO mission_claims(mission_id, claimant_id, proof) VALUES (_mission_id, _u, _proof) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Verify and payout mission claim
CREATE OR REPLACE FUNCTION public.verify_mission_claim(_claim_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _c mission_claims%ROWTYPE; _m economic_missions%ROWTYPE;
BEGIN
  SELECT * INTO _c FROM mission_claims WHERE id = _claim_id FOR UPDATE;
  SELECT * INTO _m FROM economic_missions WHERE id = _c.mission_id FOR UPDATE;
  IF _u <> _m.creator_id AND NOT has_role(_u,'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF _c.status <> 'pending' THEN RAISE EXCEPTION 'Already processed'; END IF;
  IF _approve THEN
    PERFORM process_wallet_movement(_m.creator_id, 'debit', _m.reward, 'mission_payout', 'Mission reward', 'mission', _m.id);
    PERFORM process_wallet_movement(_c.claimant_id, 'credit', _m.reward, 'mission_reward', 'Mission reward received', 'mission', _m.id);
    UPDATE mission_claims SET status='paid', verified_by=_u, paid_amount=_m.reward, processed_at=now() WHERE id = _claim_id;
    UPDATE economic_missions SET claims_count = claims_count + 1,
      status = CASE WHEN claims_count + 1 >= max_claims THEN 'completed' ELSE status END WHERE id = _m.id;
    INSERT INTO reputation_events(user_id, dimension, delta, reason, reference_type, reference_id)
      VALUES (_c.claimant_id, 'contributions', 5, 'Mission completed', 'mission', _m.id);
  ELSE
    UPDATE mission_claims SET status='rejected', verified_by=_u, processed_at=now() WHERE id = _claim_id;
  END IF;
END $$;

-- Recompute reputation
CREATE OR REPLACE FUNCTION public.recompute_reputation(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _trust numeric; _contrib numeric; _rel numeric; _disc numeric; _part numeric;
BEGIN
  SELECT COALESCE(SUM(delta),0) INTO _trust FROM reputation_events WHERE user_id=_user_id AND dimension='trust';
  SELECT COALESCE(SUM(delta),0) INTO _contrib FROM reputation_events WHERE user_id=_user_id AND dimension='contributions';
  SELECT COALESCE(SUM(delta),0) INTO _rel FROM reputation_events WHERE user_id=_user_id AND dimension='reliability';
  SELECT COALESCE(SUM(delta),0) INTO _disc FROM reputation_events WHERE user_id=_user_id AND dimension='discipline';
  SELECT COALESCE(SUM(delta),0) INTO _part FROM reputation_events WHERE user_id=_user_id AND dimension='participation';
  _trust := 50 + _trust; _rel := 50 + _rel; _disc := 50 + _disc;
  INSERT INTO reputation_scores(user_id, trust, contributions, reliability, discipline, participation, total, updated_at)
    VALUES (_user_id, _trust, _contrib, _rel, _disc, _part, (_trust+_rel+_disc+_contrib+_part)/5.0, now())
    ON CONFLICT (user_id) DO UPDATE SET trust=EXCLUDED.trust, contributions=EXCLUDED.contributions,
      reliability=EXCLUDED.reliability, discipline=EXCLUDED.discipline, participation=EXCLUDED.participation,
      total=EXCLUDED.total, updated_at=now();
END $$;

-- Issue proof
CREATE OR REPLACE FUNCTION public.issue_waidespruf_proof(_subject_type text, _subject_id uuid, _payload jsonb, _issued_to uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _id uuid; _hash text;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  _hash := encode(digest(_subject_type || _subject_id::text || _payload::text || now()::text, 'sha256'), 'hex');
  INSERT INTO waidespruf_proofs(subject_type, subject_id, owner_id, proof_hash, payload, issued_to)
    VALUES (_subject_type, _subject_id, _u, _hash, _payload, _issued_to) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Snapshot civilization metrics
CREATE OR REPLACE FUNCTION public.snapshot_civilization_metrics()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _users int; _entities int; _treas int; _tx int; _onyix numeric; _smai numeric; _tb int;
BEGIN
  SELECT count(*) INTO _users FROM profiles;
  SELECT count(*) INTO _entities FROM konsmik_entities WHERE is_active;
  SELECT count(*) INTO _treas FROM entity_treasuries;
  SELECT count(*) INTO _tx FROM transactions;
  SELECT COALESCE(SUM(circulating),0) INTO _onyix FROM onyix_reserves;
  SELECT COALESCE(SUM(total_balance),0) INTO _smai FROM wallets WHERE currency_type='SMAI_SIKA';
  SELECT count(*) INTO _tb FROM tredbeings WHERE is_active;
  INSERT INTO civilization_metrics_daily(snapshot_date, total_users, total_entities, total_treasuries, total_transactions, total_onyix, total_smaisika, active_tredbeings, computed_at)
    VALUES (CURRENT_DATE, _users, _entities, _treas, _tx, _onyix, _smai, _tb, now())
  ON CONFLICT (snapshot_date) DO UPDATE SET total_users=EXCLUDED.total_users, total_entities=EXCLUDED.total_entities,
    total_treasuries=EXCLUDED.total_treasuries, total_transactions=EXCLUDED.total_transactions,
    total_onyix=EXCLUDED.total_onyix, total_smaisika=EXCLUDED.total_smaisika,
    active_tredbeings=EXCLUDED.active_tredbeings, computed_at=now();
END $$;

-- ============================================================
-- SEED CORE ENTITIES + RESERVE
-- ============================================================
INSERT INTO public.onyix_reserves(name, symbol, total_supply, circulating, allocated, notes)
  VALUES ('Onyix Primary', 'ONYIX', 1000000000, 0, 0, 'Primary civilizational reserve')
  ON CONFLICT (name) DO NOTHING;

INSERT INTO public.konsmik_entities(name, slug, kind, is_core, description) VALUES
  ('KonsOS', 'konsos', 'konsmik_core', true, 'Core operating layer'),
  ('KonsNet', 'konsnet', 'konsmik_core', true, 'Civilizational network graph'),
  ('WombLayer', 'womblayer', 'konsmik_core', true, 'Memory & lineage layer'),
  ('Webonyix', 'webonyix', 'konsmik_core', true, 'Onyix governance & supply'),
  ('KonsAi', 'konsai', 'konsmik_core', true, 'AI engine'),
  ('Waides KI', 'waides-ki', 'konsmik_core', true, 'Waides intelligence'),
  ('KonsPowa', 'konspowa', 'konsmik_core', true, 'Energy & compute layer'),
  ('WaidesPruf', 'waidespruf', 'konsmik_core', true, 'Proof generation layer'),
  ('WaidTred', 'waidtred', 'konsmik_core', true, 'Economic heart')
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.entity_treasuries(entity_id)
  SELECT id FROM public.konsmik_entities WHERE is_core
  ON CONFLICT (entity_id) DO NOTHING;

INSERT INTO public.prosperity_pool(balance, total_contributed, total_disbursed)
  SELECT 0, 0, 0 WHERE NOT EXISTS (SELECT 1 FROM public.prosperity_pool);
