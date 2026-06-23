
-- SokoPlace Inventory
CREATE TABLE public.sokoplace_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('token', 'crypto', 'giftcard', 'smaipin')),
  asset_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  value NUMERIC NOT NULL DEFAULT 0,
  price_in_sika NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low', 'out_of_stock', 'disabled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sokoplace_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available inventory" ON public.sokoplace_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage inventory" ON public.sokoplace_inventory
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SokoPlace Orders
CREATE TABLE public.sokoplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  order_type TEXT NOT NULL DEFAULT 'buy' CHECK (order_type IN ('buy', 'sell')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rejected')),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed')),
  delivery_data JSONB DEFAULT '{}'::jsonb,
  proof_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sokoplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON public.sokoplace_orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create buy orders" ON public.sokoplace_orders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders" ON public.sokoplace_orders
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Pricing Rules
CREATE TABLE public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type TEXT NOT NULL,
  asset_name TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  spread_percentage NUMERIC NOT NULL DEFAULT 5,
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing" ON public.pricing_rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage pricing" ON public.pricing_rules
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enhance smai_pins with chain/pruf fields
ALTER TABLE public.smai_pins
  ADD COLUMN IF NOT EXISTS code_hash TEXT,
  ADD COLUMN IF NOT EXISTS waideschain_hash TEXT,
  ADD COLUMN IF NOT EXISTS waidespruf_signature TEXT;
