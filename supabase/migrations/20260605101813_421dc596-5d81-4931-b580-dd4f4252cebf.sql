
-- Helper functions (SECURITY DEFINER) to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM circle_members WHERE circle_id = _circle_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM group_members WHERE group_id = _group_id AND user_id = _user_id)
$$;

-- circle_members: restrict SELECT to members of same circle
DROP POLICY IF EXISTS "view cm" ON public.circle_members;
CREATE POLICY "view circle members" ON public.circle_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_circle_member(circle_id, auth.uid()));

-- group_members: restrict SELECT to members of same group
DROP POLICY IF EXISTS "view members" ON public.group_members;
CREATE POLICY "view group members" ON public.group_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_group_member(group_id, auth.uid()));

-- group_contributions: restrict SELECT to members of same group
DROP POLICY IF EXISTS "view contribs" ON public.group_contributions;
CREATE POLICY "view group contribs" ON public.group_contributions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_group_member(group_id, auth.uid()));

-- tip_jars: require authentication
DROP POLICY IF EXISTS "view tips" ON public.tip_jars;
CREATE POLICY "view tips" ON public.tip_jars
  FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.tip_jars FROM anon;

-- smai_pins: only redeem unredeemed pins
DROP POLICY IF EXISTS "Users can redeem active pins" ON public.smai_pins;
CREATE POLICY "Users can redeem active pins" ON public.smai_pins
  FOR UPDATE TO authenticated
  USING (status = 'active' AND redeemed_by IS NULL)
  WITH CHECK (redeemed_by = auth.uid());

-- user_roles: prevent users from updating/deleting their own role rows
-- (No existing UPDATE/DELETE policies → already default-denied for non-admins.
--  Add explicit admin-only policies to be unambiguous.)
DROP POLICY IF EXISTS "Admins manage roles update" ON public.user_roles;
CREATE POLICY "Admins manage roles update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles delete" ON public.user_roles;
CREATE POLICY "Admins manage roles delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
