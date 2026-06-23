
-- ============ AI Chat ============
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New chat',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conv" ON public.chat_conversations FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','tool','system')),
  content text,
  tool_calls jsonb,
  tool_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_msg_conv ON public.chat_messages(conversation_id, created_at);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own msg" ON public.chat_messages FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ Scheduled actions (reminders, future sends) ============
CREATE TABLE public.scheduled_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('reminder','send_money','request_money','notify_contact')),
  target_user_id uuid,
  target_contact text,
  amount numeric,
  message text,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','executed','failed','cancelled')),
  result jsonb,
  created_via text DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
CREATE INDEX idx_sched_due ON public.scheduled_actions(status, scheduled_for) WHERE status = 'pending';
ALTER TABLE public.scheduled_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sched" ON public.scheduled_actions FOR ALL USING (user_id = auth.uid() OR target_user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ News (Waides Niuz) ============
CREATE TABLE public.news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  source text,
  category text,
  is_breaking boolean DEFAULT false,
  cover_url text,
  published_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view news" ON public.news_articles FOR SELECT USING (true);
CREATE POLICY "admin news" ON public.news_articles FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ Trade orders (WaidTrade) ============
CREATE TABLE public.trade_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  asset_symbol text NOT NULL,
  quantity numeric NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'filled',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trade" ON public.trade_orders FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ FX quotes (SmaiTredEx) ============
CREATE TABLE public.fx_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base text NOT NULL,
  quote text NOT NULL,
  rate numeric NOT NULL,
  change_24h numeric DEFAULT 0,
  volume_24h numeric DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(base, quote)
);
ALTER TABLE public.fx_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view fx" ON public.fx_quotes FOR SELECT USING (true);
CREATE POLICY "admin fx" ON public.fx_quotes FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- ============ POS sales ============
CREATE TABLE public.pos_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL,
  customer_id uuid,
  amount numeric NOT NULL,
  method text NOT NULL DEFAULT 'qr',
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchant pos" ON public.pos_sales FOR ALL USING (merchant_id = auth.uid()) WITH CHECK (merchant_id = auth.uid());

-- Seed FX quotes
INSERT INTO public.fx_quotes (base, quote, rate, change_24h, volume_24h) VALUES
('SMK','USD',0.85,0.2,1200000),('SMK','GHS',12.50,0.5,890000),
('SMK','EUR',0.78,-0.1,650000),('SMK','NGN',1350,1.2,2100000),
('SMK','KES',128,0.3,430000);

-- Seed news
INSERT INTO public.news_articles (title, body, source, category, is_breaking) VALUES
('Smai Sika Adoption Grows 40% in East Africa','Cross-border volume surged this quarter.','Konsmik Report','Economy',true),
('WaidTred Launches in 5 New Countries','Expansion accelerates across Africa.','WaidTred Blog','Platform',true),
('Understanding Digital Currency Regulations','A primer for new users.','Waides Akademi','Learning',false);

-- Helper: schedule an action (used by AI tool)
CREATE OR REPLACE FUNCTION public.create_scheduled_action(
  _action_type text, _scheduled_for timestamptz, _message text DEFAULT NULL,
  _target_contact text DEFAULT NULL, _target_user_id uuid DEFAULT NULL, _amount numeric DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u uuid := auth.uid(); _id uuid;
BEGIN
  IF _u IS NULL THEN RAISE EXCEPTION 'Auth required'; END IF;
  INSERT INTO scheduled_actions(user_id, action_type, scheduled_for, message, target_contact, target_user_id, amount, created_via)
  VALUES (_u, _action_type, _scheduled_for, _message, _target_contact, _target_user_id, _amount, 'konsai')
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Executor (called by service-role cron)
CREATE OR REPLACE FUNCTION public.execute_due_scheduled_actions()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _a scheduled_actions%ROWTYPE; _count int := 0; _target uuid;
BEGIN
  FOR _a IN SELECT * FROM scheduled_actions WHERE status='pending' AND scheduled_for <= now() LIMIT 100 LOOP
    BEGIN
      _target := _a.target_user_id;
      IF _target IS NULL AND _a.target_contact IS NOT NULL THEN
        SELECT id INTO _target FROM profiles WHERE phone = _a.target_contact OR email = _a.target_contact LIMIT 1;
      END IF;
      IF _a.action_type = 'reminder' THEN
        INSERT INTO notifications(user_id, type, title, body) VALUES (_a.user_id, 'reminder', 'Reminder', COALESCE(_a.message,'Reminder'));
      ELSIF _a.action_type = 'notify_contact' AND _target IS NOT NULL THEN
        INSERT INTO notifications(user_id, type, title, body) VALUES (_target, 'message', 'Message from contact', COALESCE(_a.message,''));
      ELSIF _a.action_type = 'send_money' AND _target IS NOT NULL AND _a.amount > 0 THEN
        PERFORM process_wallet_movement(_a.user_id, 'debit', _a.amount, 'transfer_out', _a.message, 'scheduled_action', _a.id);
        PERFORM process_wallet_movement(_target, 'credit', _a.amount, 'transfer_in', _a.message, 'scheduled_action', _a.id);
        INSERT INTO notifications(user_id, type, title, body) VALUES (_target, 'tx', 'Money received', _a.amount || ' Smai Sika received');
      ELSIF _a.action_type = 'request_money' AND _target IS NOT NULL THEN
        INSERT INTO payment_requests(requester_id, payer_id, payer_contact, amount, reason) VALUES (_a.user_id, _target, _a.target_contact, _a.amount, _a.message);
        INSERT INTO notifications(user_id, type, title, body) VALUES (_target, 'request', 'Payment request', 'You have a request for ' || _a.amount || ' Smai Sika');
      END IF;
      UPDATE scheduled_actions SET status='executed', executed_at=now() WHERE id=_a.id;
      _count := _count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE scheduled_actions SET status='failed', result=jsonb_build_object('error',SQLERRM), executed_at=now() WHERE id=_a.id;
    END;
  END LOOP;
  RETURN _count;
END $$;
