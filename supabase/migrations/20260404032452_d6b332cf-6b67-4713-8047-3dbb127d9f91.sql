
-- Create smai_pins table
CREATE TABLE public.smai_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_code TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SMK',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'revoked', 'expired')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smai_pins ENABLE ROW LEVEL SECURITY;

-- Admins can manage all pins
CREATE POLICY "Admins can manage smai_pins"
  ON public.smai_pins FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own redeemed pins
CREATE POLICY "Users can view own redeemed pins"
  ON public.smai_pins FOR SELECT TO authenticated
  USING (redeemed_by = auth.uid());

-- Users can update pins (redeem) if pin is active
CREATE POLICY "Users can redeem active pins"
  ON public.smai_pins FOR UPDATE TO authenticated
  USING (status = 'active')
  WITH CHECK (redeemed_by = auth.uid());

-- Expand app_role enum to include super_admin, agent, moderator
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';
