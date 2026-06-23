
-- WEALTH
CREATE TABLE public.savings_goals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, name TEXT NOT NULL, target_amount NUMERIC NOT NULL, current_amount NUMERIC NOT NULL DEFAULT 0, deadline DATE, auto_contribute_amount NUMERIC DEFAULT 0, auto_contribute_frequency TEXT, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.savings_goals FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.investment_baskets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, asset_class TEXT NOT NULL, risk_level TEXT NOT NULL DEFAULT 'medium', nav NUMERIC NOT NULL DEFAULT 100, ytd_return NUMERIC DEFAULT 0, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.investment_baskets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view baskets" ON public.investment_baskets FOR SELECT USING (true);
CREATE POLICY "admin baskets" ON public.investment_baskets FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.user_holdings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, basket_id UUID NOT NULL REFERENCES public.investment_baskets(id) ON DELETE CASCADE, units NUMERIC NOT NULL DEFAULT 0, avg_cost NUMERIC NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own holdings" ON public.user_holdings FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.yield_stakes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, principal NUMERIC NOT NULL, apy NUMERIC NOT NULL DEFAULT 8, accrued NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', started_at TIMESTAMPTZ NOT NULL DEFAULT now(), unstaked_at TIMESTAMPTZ);
ALTER TABLE public.yield_stakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stakes" ON public.yield_stakes FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.loans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, principal NUMERIC NOT NULL, interest_rate NUMERIC NOT NULL, term_months INTEGER NOT NULL, balance NUMERIC NOT NULL, monthly_payment NUMERIC NOT NULL, purpose TEXT, status TEXT NOT NULL DEFAULT 'pending', approved_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own loans s" ON public.loans FOR SELECT USING (user_id=auth.uid());
CREATE POLICY "own loans i" ON public.loans FOR INSERT WITH CHECK (user_id=auth.uid());
CREATE POLICY "admin loans" ON public.loans FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.insurance_policies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, policy_type TEXT NOT NULL, coverage_amount NUMERIC NOT NULL, monthly_premium NUMERIC NOT NULL, status TEXT NOT NULL DEFAULT 'active', starts_at DATE NOT NULL DEFAULT CURRENT_DATE, ends_at DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own policies" ON public.insurance_policies FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.pensions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE, monthly_contribution NUMERIC NOT NULL DEFAULT 0, employer_match_pct NUMERIC DEFAULT 0, balance NUMERIC NOT NULL DEFAULT 0, retirement_age INTEGER DEFAULT 60, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.pensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pension" ON public.pensions FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.savings_groups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, contribution_amount NUMERIC NOT NULL, frequency TEXT NOT NULL DEFAULT 'monthly', created_by UUID NOT NULL, member_count INTEGER NOT NULL DEFAULT 1, pool_balance NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.savings_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view groups" ON public.savings_groups FOR SELECT USING (true);
CREATE POLICY "create groups" ON public.savings_groups FOR INSERT WITH CHECK (created_by=auth.uid());
CREATE POLICY "creator update" ON public.savings_groups FOR UPDATE USING (created_by=auth.uid());

CREATE TABLE public.group_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE, user_id UUID NOT NULL, role TEXT NOT NULL DEFAULT 'member', joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(group_id, user_id));
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view members" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "join groups" ON public.group_members FOR INSERT WITH CHECK (user_id=auth.uid());
CREATE POLICY "leave groups" ON public.group_members FOR DELETE USING (user_id=auth.uid());

CREATE TABLE public.group_contributions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE, user_id UUID NOT NULL, amount NUMERIC NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.group_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view contribs" ON public.group_contributions FOR SELECT USING (true);
CREATE POLICY "own contribs" ON public.group_contributions FOR INSERT WITH CHECK (user_id=auth.uid());

CREATE TABLE public.budgets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, month DATE NOT NULL, total_budget NUMERIC NOT NULL, total_spent NUMERIC NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, month));
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own budgets" ON public.budgets FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.budget_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), budget_id UUID NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE, user_id UUID NOT NULL, category TEXT NOT NULL, allocated NUMERIC NOT NULL, spent NUMERIC NOT NULL DEFAULT 0);
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cats" ON public.budget_categories FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.tax_setasides (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE, pct NUMERIC NOT NULL DEFAULT 15, balance NUMERIC NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.tax_setasides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tax" ON public.tax_setasides FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- PAYMENTS (split_bills + split_participants both created before policies that cross-reference)
CREATE TABLE public.split_bills (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), creator_id UUID NOT NULL, title TEXT NOT NULL, total_amount NUMERIC NOT NULL, status TEXT NOT NULL DEFAULT 'open', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "create splits" ON public.split_bills FOR INSERT WITH CHECK (creator_id=auth.uid());

CREATE TABLE public.split_participants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bill_id UUID NOT NULL REFERENCES public.split_bills(id) ON DELETE CASCADE, user_id UUID, contact_name TEXT, share NUMERIC NOT NULL, paid BOOLEAN NOT NULL DEFAULT false, paid_at TIMESTAMPTZ);
ALTER TABLE public.split_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view splits" ON public.split_bills FOR SELECT USING (creator_id=auth.uid() OR EXISTS (SELECT 1 FROM public.split_participants WHERE bill_id=split_bills.id AND user_id=auth.uid()));
CREATE POLICY "view parts" ON public.split_participants FOR SELECT USING (user_id=auth.uid() OR EXISTS (SELECT 1 FROM public.split_bills WHERE id=split_participants.bill_id AND creator_id=auth.uid()));
CREATE POLICY "create parts" ON public.split_participants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.split_bills WHERE id=bill_id AND creator_id=auth.uid()));
CREATE POLICY "update own part" ON public.split_participants FOR UPDATE USING (user_id=auth.uid());

CREATE TABLE public.payment_requests (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), requester_id UUID NOT NULL, payer_id UUID, payer_contact TEXT, amount NUMERIC NOT NULL, reason TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view req" ON public.payment_requests FOR SELECT USING (requester_id=auth.uid() OR payer_id=auth.uid());
CREATE POLICY "create req" ON public.payment_requests FOR INSERT WITH CHECK (requester_id=auth.uid());
CREATE POLICY "payer respond" ON public.payment_requests FOR UPDATE USING (payer_id=auth.uid());

CREATE TABLE public.subscriptions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, merchant_name TEXT NOT NULL, amount NUMERIC NOT NULL, frequency TEXT NOT NULL DEFAULT 'monthly', next_charge DATE NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs" ON public.subscriptions FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.escrow_deals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), buyer_id UUID NOT NULL, seller_id UUID NOT NULL, amount NUMERIC NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'held', buyer_confirmed BOOLEAN DEFAULT false, seller_confirmed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), released_at TIMESTAMPTZ);
ALTER TABLE public.escrow_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view escrow" ON public.escrow_deals FOR SELECT USING (buyer_id=auth.uid() OR seller_id=auth.uid());
CREATE POLICY "create escrow" ON public.escrow_deals FOR INSERT WITH CHECK (buyer_id=auth.uid());
CREATE POLICY "update escrow" ON public.escrow_deals FOR UPDATE USING (buyer_id=auth.uid() OR seller_id=auth.uid());

CREATE TABLE public.payroll_runs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employer_id UUID NOT NULL, period TEXT NOT NULL, total_amount NUMERIC NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payroll" ON public.payroll_runs FOR ALL USING (employer_id=auth.uid()) WITH CHECK (employer_id=auth.uid());

CREATE TABLE public.payroll_employees (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE, employer_id UUID NOT NULL, employee_name TEXT NOT NULL, employee_user_id UUID, role TEXT, salary NUMERIC NOT NULL, paid BOOLEAN DEFAULT false);
ALTER TABLE public.payroll_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own emps" ON public.payroll_employees FOR ALL USING (employer_id=auth.uid()) WITH CHECK (employer_id=auth.uid());

CREATE TABLE public.tip_jars (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, slug TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, message TEXT, total_received NUMERIC NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.tip_jars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view tips" ON public.tip_jars FOR SELECT USING (true);
CREATE POLICY "own tips" ON public.tip_jars FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.virtual_cards (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, card_number_last4 TEXT NOT NULL, nickname TEXT, spend_limit NUMERIC, current_spend NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cards" ON public.virtual_cards FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.bill_payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, biller TEXT NOT NULL, account_number TEXT NOT NULL, amount NUMERIC NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bills" ON public.bill_payments FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- MARKETPLACE
CREATE TABLE public.storefronts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID NOT NULL, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, description TEXT, banner_url TEXT, rating NUMERIC DEFAULT 0, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view stores" ON public.storefronts FOR SELECT USING (true);
CREATE POLICY "own store" ON public.storefronts FOR ALL USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid());

CREATE TABLE public.product_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, user_id UUID NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), title TEXT, body TEXT, verified_purchase BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "own reviews" ON public.product_reviews FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.wishlists (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, product_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, product_id));
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlists FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.flash_deals (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL, discount_pct NUMERIC NOT NULL, stock_left INTEGER NOT NULL, starts_at TIMESTAMPTZ NOT NULL DEFAULT now(), ends_at TIMESTAMPTZ NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view deals" ON public.flash_deals FOR SELECT USING (true);
CREATE POLICY "admin deals" ON public.flash_deals FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.shipments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID, user_id UUID NOT NULL, carrier TEXT, tracking_code TEXT, status TEXT NOT NULL DEFAULT 'pending', eta DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ship" ON public.shipments FOR SELECT USING (user_id=auth.uid());
CREATE POLICY "admin ship" ON public.shipments FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- SOCIAL
CREATE TABLE public.circles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT, created_by UUID NOT NULL, is_private BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.circle_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE, user_id UUID NOT NULL, joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(circle_id, user_id));
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view circles" ON public.circles FOR SELECT USING (NOT is_private OR EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id=circles.id AND user_id=auth.uid()));
CREATE POLICY "create circles" ON public.circles FOR INSERT WITH CHECK (created_by=auth.uid());
CREATE POLICY "view cm" ON public.circle_members FOR SELECT USING (true);
CREATE POLICY "join circle" ON public.circle_members FOR INSERT WITH CHECK (user_id=auth.uid());
CREATE POLICY "leave circle" ON public.circle_members FOR DELETE USING (user_id=auth.uid());

CREATE TABLE public.posts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, circle_id UUID REFERENCES public.circles(id) ON DELETE CASCADE, body TEXT NOT NULL, media_url TEXT, like_count INTEGER NOT NULL DEFAULT 0, comment_count INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view posts" ON public.posts FOR SELECT USING (circle_id IS NULL OR EXISTS (SELECT 1 FROM public.circles c WHERE c.id=circle_id AND (NOT c.is_private OR EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id=c.id AND user_id=auth.uid()))));
CREATE POLICY "own posts" ON public.posts FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.post_likes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, user_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(post_id, user_id));
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "own likes" ON public.post_likes FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.post_comments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE, user_id UUID NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "own comments" ON public.post_comments FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- INTELLIGENCE / BUSINESS
CREATE TABLE public.fraud_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, severity TEXT NOT NULL, event_type TEXT NOT NULL, description TEXT, action_taken TEXT, resolved BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.fraud_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fraud" ON public.fraud_events FOR SELECT USING (user_id=auth.uid());
CREATE POLICY "admin fraud" ON public.fraud_events FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.merchants (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID NOT NULL UNIQUE, business_name TEXT NOT NULL, category TEXT, registration_number TEXT, kyb_status TEXT NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own merch" ON public.merchants FOR ALL USING (owner_id=auth.uid()) WITH CHECK (owner_id=auth.uid());
CREATE POLICY "admin merch" ON public.merchants FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.invoices (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, invoice_number TEXT NOT NULL, client_name TEXT NOT NULL, client_email TEXT, total NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft', due_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own inv" ON public.invoices FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.invoice_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE, user_id UUID NOT NULL, description TEXT NOT NULL, quantity NUMERIC NOT NULL DEFAULT 1, unit_price NUMERIC NOT NULL);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own items" ON public.invoice_items FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.api_keys (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, name TEXT NOT NULL, key_prefix TEXT NOT NULL, key_hash TEXT NOT NULL, scopes TEXT[] DEFAULT ARRAY['read'], last_used_at TIMESTAMPTZ, status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own keys" ON public.api_keys FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- ENGAGEMENT
CREATE TABLE public.missions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, reward_amount NUMERIC NOT NULL, goal_type TEXT NOT NULL, goal_target NUMERIC NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "admin missions" ON public.missions FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.user_missions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE, progress NUMERIC NOT NULL DEFAULT 0, completed BOOLEAN DEFAULT false, rewarded_at TIMESTAMPTZ, UNIQUE(user_id, mission_id));
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missions" ON public.user_missions FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.courses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title TEXT NOT NULL, description TEXT, cover_url TEXT, level TEXT, is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "admin courses" ON public.courses FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.lessons (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT, video_url TEXT, position INTEGER NOT NULL DEFAULT 0);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "admin lessons" ON public.lessons FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.enrollments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE, progress_pct NUMERIC NOT NULL DEFAULT 0, completed_at TIMESTAMPTZ, enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, course_id));
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enroll" ON public.enrollments FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.affiliate_links (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, code TEXT NOT NULL UNIQUE, clicks INTEGER NOT NULL DEFAULT 0, conversions INTEGER NOT NULL DEFAULT 0, earnings NUMERIC NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own aff" ON public.affiliate_links FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- OPS
CREATE TABLE public.countries (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, currency_code TEXT NOT NULL, flag_emoji TEXT, is_enabled BOOLEAN NOT NULL DEFAULT true, fx_to_smk NUMERIC NOT NULL DEFAULT 1);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "admin countries" ON public.countries FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.support_tickets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', assigned_to UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets" ON public.support_tickets FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
CREATE POLICY "staff tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'agent') OR has_role(auth.uid(),'moderator')) WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'agent') OR has_role(auth.uid(),'moderator'));

CREATE TABLE public.support_messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE, sender_id UUID NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view ticket msgs" ON public.support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE id=ticket_id AND (user_id=auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'agent') OR has_role(auth.uid(),'moderator'))));
CREATE POLICY "send ticket msgs" ON public.support_messages FOR INSERT WITH CHECK (sender_id=auth.uid());

CREATE TABLE public.disputes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, transaction_id UUID, reason TEXT NOT NULL, description TEXT, evidence_url TEXT, status TEXT NOT NULL DEFAULT 'open', resolution TEXT, resolved_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), resolved_at TIMESTAMPTZ);
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own disputes" ON public.disputes FOR SELECT USING (user_id=auth.uid());
CREATE POLICY "create disputes" ON public.disputes FOR INSERT WITH CHECK (user_id=auth.uid());
CREATE POLICY "mod disputes" ON public.disputes FOR ALL USING (has_role(auth.uid(),'moderator') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'moderator') OR has_role(auth.uid(),'admin'));

CREATE TABLE public.risk_scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL UNIQUE, score INTEGER NOT NULL DEFAULT 50, factors JSONB DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin risk" ON public.risk_scores FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "own risk" ON public.risk_scores FOR SELECT USING (user_id=auth.uid());

CREATE TABLE public.flagged_content (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id UUID, content_type TEXT NOT NULL, content_id UUID NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', reviewed_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "create flag" ON public.flagged_content FOR INSERT WITH CHECK (reporter_id=auth.uid());
CREATE POLICY "mod flags" ON public.flagged_content FOR ALL USING (has_role(auth.uid(),'moderator') OR has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'moderator') OR has_role(auth.uid(),'admin'));

-- SEEDS
INSERT INTO public.investment_baskets(name, description, asset_class, risk_level, nav, ytd_return) VALUES
  ('Africa Growth','Pan-African equity basket','equity','high',124.50,18.2),
  ('Stable Yield','T-bills and money market','fixed_income','low',102.10,6.4),
  ('Tech Innovators','Global tech leaders','equity','high',156.30,24.8),
  ('Balanced Mix','60/40 equity-bonds','mixed','medium',110.80,11.5);

INSERT INTO public.countries(code,name,currency_code,flag_emoji,fx_to_smk) VALUES
  ('GH','Ghana','GHS','🇬🇭',0.85),('NG','Nigeria','NGN','🇳🇬',0.0012),
  ('KE','Kenya','KES','🇰🇪',0.0078),('ZA','South Africa','ZAR','🇿🇦',0.054),
  ('US','United States','USD','🇺🇸',10),('GB','United Kingdom','GBP','🇬🇧',12.6);

INSERT INTO public.missions(title,description,reward_amount,goal_type,goal_target) VALUES
  ('First Send','Send your first transfer',5,'transfer_count',1),
  ('Saver','Lock 100 Smai Sika',10,'lock_amount',100),
  ('Social Butterfly','Refer 3 friends',25,'referral_count',3);
