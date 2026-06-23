-- Trusted withdrawal initiation, approval and provider settlement state machines.

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  _beneficiary_id uuid,
  _amount numeric
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _beneficiary public.bank_beneficiaries%ROWTYPE;
  _wallet_id uuid;
  _withdrawal_id uuid;
  _transaction_id uuid;
  _fee numeric := 0;
  _total numeric;
  _balance numeric;
  _available numeric;
  _risk numeric := 0;
  _flags jsonb := '[]'::jsonb;
  _velocity integer;
  _profile_created timestamptz;
  _fx_rate numeric;
  _wallet_amount numeric;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR scale(_amount) > 2 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  SELECT * INTO _beneficiary FROM public.bank_beneficiaries
  WHERE id = _beneficiary_id AND user_id = _user AND is_verified;
  IF _beneficiary.id IS NULL THEN RAISE EXCEPTION 'Verified beneficiary not found'; END IF;
  SELECT fx_to_smk INTO _fx_rate FROM public.countries
  WHERE code = _beneficiary.country_code AND currency_code = _beneficiary.currency_code AND status = 'active';
  IF _fx_rate IS NULL OR _fx_rate <= 0 THEN RAISE EXCEPTION 'Currency conversion is unavailable'; END IF;
  _wallet_amount := round(_amount * _fx_rate, 2);
  IF _wallet_amount <= 0 THEN RAISE EXCEPTION 'Converted amount is too small'; END IF;
  PERFORM public.enforce_kyc_limit(_user, _wallet_amount, 'withdrawal');
  IF EXISTS (
    SELECT 1 FROM public.withdrawal_requests
    WHERE user_id = _user AND beneficiary_id = _beneficiary_id AND amount = _amount
      AND status IN ('pending', 'approved', 'processing')
      AND created_at >= now() - interval '5 minutes'
  ) THEN RAISE EXCEPTION 'Duplicate withdrawal request'; END IF;

  SELECT created_at INTO _profile_created FROM public.profiles WHERE id = _user;
  SELECT count(*) INTO _velocity FROM public.withdrawal_requests
  WHERE user_id = _user AND created_at >= now() - interval '24 hours'
    AND status NOT IN ('rejected', 'cancelled');
  IF _velocity >= 3 THEN _risk := _risk + 35; _flags := _flags || '"withdrawal_velocity"'::jsonb; END IF;
  IF _beneficiary.created_at >= now() - interval '24 hours' THEN _risk := _risk + 20; _flags := _flags || '"new_beneficiary"'::jsonb; END IF;
  IF _profile_created >= now() - interval '7 days' THEN _risk := _risk + 20; _flags := _flags || '"new_account"'::jsonb; END IF;

  _total := _wallet_amount + _fee;
  SELECT id, total_balance, available_balance INTO _wallet_id, _balance, _available
  FROM public.wallets WHERE user_id = _user AND currency_type = 'SMAI_SIKA' FOR UPDATE;
  IF _wallet_id IS NULL OR _available < _total THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;
  IF _balance > 0 AND _total >= _balance * 0.5 THEN _risk := _risk + 25; _flags := _flags || '"large_balance_ratio"'::jsonb; END IF;

  INSERT INTO public.transactions(user_id, type, title, amount, currency, recipient, status)
  VALUES (_user, 'withdrawal', 'Bank withdrawal', _wallet_amount, 'SMK', _beneficiary.account_name, 'pending')
  RETURNING id INTO _transaction_id;
  INSERT INTO public.withdrawal_requests(
    user_id, beneficiary_id, amount, wallet_amount, fee, currency_code, country_code, status, risk_score, risk_flags
  ) VALUES (
    _user, _beneficiary_id, _amount, _wallet_amount, _fee, _beneficiary.currency_code, _beneficiary.country_code, 'pending', _risk, _flags
  ) RETURNING id INTO _withdrawal_id;

  UPDATE public.wallets
  SET available_balance = available_balance - _total,
      locked_balance = locked_balance + _total,
      last_updated = now()
  WHERE id = _wallet_id AND available_balance >= _total
  RETURNING total_balance INTO _balance;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;

  INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
  VALUES (_wallet_id, _user, 'debit', _total, _balance, 'withdrawal_hold', 'withdrawal', _withdrawal_id, 'Funds held for withdrawal');
  UPDATE public.transactions SET description = 'Withdrawal request ' || _withdrawal_id WHERE id = _transaction_id;
  RETURN _withdrawal_id;
END;
$$;
REVOKE ALL ON FUNCTION public.request_withdrawal(uuid, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(uuid, numeric) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(
  _withdrawal_id uuid,
  _approve boolean,
  _reason text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _withdrawal public.withdrawal_requests%ROWTYPE;
  _provider uuid;
  _provider_tx uuid;
  _wallet public.wallets%ROWTYPE;
BEGIN
  IF _admin IS NULL OR NOT (public.has_role(_admin, 'admin') OR public.has_role(_admin, 'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT * INTO _withdrawal FROM public.withdrawal_requests WHERE id = _withdrawal_id FOR UPDATE;
  IF _withdrawal.id IS NULL OR _withdrawal.status <> 'pending' THEN RAISE EXCEPTION 'Withdrawal is not pending'; END IF;
  IF _approve AND coalesce(_withdrawal.risk_score, 0) >= 80 AND NOT public.has_role(_admin, 'super_admin') THEN
    RAISE EXCEPTION 'High-risk withdrawal requires super-admin approval';
  END IF;

  IF NOT _approve THEN
    IF nullif(trim(_reason), '') IS NULL THEN RAISE EXCEPTION 'Rejection reason is required'; END IF;
    SELECT * INTO _wallet FROM public.wallets WHERE user_id = _withdrawal.user_id AND currency_type = 'SMAI_SIKA' FOR UPDATE;
    UPDATE public.wallets SET
      available_balance = available_balance + _withdrawal.wallet_amount + _withdrawal.fee,
      locked_balance = locked_balance - _withdrawal.wallet_amount - _withdrawal.fee,
      last_updated = now()
    WHERE id = _wallet.id AND locked_balance >= _withdrawal.wallet_amount + _withdrawal.fee;
    IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal hold is inconsistent'; END IF;
    INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
    VALUES (_wallet.id, _withdrawal.user_id, 'credit', _withdrawal.wallet_amount + _withdrawal.fee, _wallet.total_balance, 'withdrawal_release', 'withdrawal', _withdrawal.id, _reason);
    UPDATE public.withdrawal_requests SET status = 'rejected', rejection_reason = _reason WHERE id = _withdrawal.id;
    UPDATE public.transactions SET status = 'failed' WHERE user_id = _withdrawal.user_id AND description = 'Withdrawal request ' || _withdrawal.id;
    _provider_tx := NULL;
  ELSE
    SELECT provider_id INTO _provider FROM public.resolve_provider('payout', _withdrawal.country_code) LIMIT 1;
    IF _provider IS NULL THEN RAISE EXCEPTION 'No active payout route for country'; END IF;
    INSERT INTO public.provider_transactions(
      user_id, provider_id, internal_transaction_id, service_kind, direction, amount, wallet_amount, fx_rate, fee,
      currency_code, country_code, idempotency_key, client_reference, status
    )
    SELECT _withdrawal.user_id, _provider, t.id, 'payout', 'outbound', _withdrawal.amount, _withdrawal.wallet_amount,
      CASE WHEN _withdrawal.amount > 0 THEN _withdrawal.wallet_amount / _withdrawal.amount ELSE 1 END, _withdrawal.fee,
      _withdrawal.currency_code, _withdrawal.country_code, 'withdrawal:' || _withdrawal.id, 'WD-' || _withdrawal.id, 'pending'
    FROM public.transactions t
    WHERE t.user_id = _withdrawal.user_id AND t.description = 'Withdrawal request ' || _withdrawal.id
    LIMIT 1
    RETURNING id INTO _provider_tx;
    IF _provider_tx IS NULL THEN RAISE EXCEPTION 'Withdrawal transaction mapping not found'; END IF;
    UPDATE public.withdrawal_requests SET status = 'approved', approved_by = _admin, approved_at = now(), provider_transaction_id = _provider_tx WHERE id = _withdrawal.id;
    UPDATE public.transactions SET status = 'processing' WHERE user_id = _withdrawal.user_id AND description = 'Withdrawal request ' || _withdrawal.id;
  END IF;

  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, after_state)
  VALUES (_admin, 'withdrawal_review', 'withdrawal', _withdrawal.id::text, jsonb_build_object('approved', _approve, 'reason', _reason, 'provider_transaction_id', _provider_tx));
  RETURN _provider_tx;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, boolean, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.settle_provider_transaction(
  _provider_transaction_id uuid,
  _provider_reference text,
  _status text,
  _response jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _provider_tx public.provider_transactions%ROWTYPE;
  _withdrawal public.withdrawal_requests%ROWTYPE;
  _wallet public.wallets%ROWTYPE;
  _transaction_id uuid;
  _total numeric;
BEGIN
  IF _status NOT IN ('successful', 'failed') THEN RAISE EXCEPTION 'Unsupported settlement status'; END IF;
  SELECT * INTO _provider_tx FROM public.provider_transactions WHERE id = _provider_transaction_id FOR UPDATE;
  IF _provider_tx.id IS NULL THEN RAISE EXCEPTION 'Provider transaction not found'; END IF;
  IF _provider_tx.status = _status THEN RETURN; END IF;
  IF _provider_tx.status NOT IN ('pending', 'processing') THEN RAISE EXCEPTION 'Provider transaction is already final'; END IF;

  IF _provider_tx.direction = 'inbound' AND _provider_tx.service_kind = 'deposit' THEN
    IF _status = 'successful' THEN
      INSERT INTO public.transactions(user_id, type, title, amount, currency, status)
      VALUES (_provider_tx.user_id, 'received', 'Wallet funding', _provider_tx.amount, _provider_tx.currency_code, 'completed')
      RETURNING id INTO _transaction_id;
      PERFORM public.process_wallet_movement(_provider_tx.user_id, 'credit', _provider_tx.wallet_amount, 'provider_deposit', 'Verified provider deposit', 'transaction', _transaction_id);
    END IF;
  ELSIF _provider_tx.direction = 'outbound' AND _provider_tx.service_kind = 'payout' THEN
    SELECT * INTO _withdrawal FROM public.withdrawal_requests WHERE provider_transaction_id = _provider_tx.id FOR UPDATE;
    IF _withdrawal.id IS NULL THEN RAISE EXCEPTION 'Withdrawal mapping not found'; END IF;
    SELECT * INTO _wallet FROM public.wallets WHERE user_id = _provider_tx.user_id AND currency_type = 'SMAI_SIKA' FOR UPDATE;
    _total := _withdrawal.wallet_amount + _withdrawal.fee;
    IF _status = 'successful' THEN
      UPDATE public.wallets SET locked_balance = locked_balance - _total, total_balance = total_balance - _total, last_updated = now()
      WHERE id = _wallet.id AND locked_balance >= _total;
      IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal hold is inconsistent'; END IF;
      INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
      VALUES (_wallet.id, _provider_tx.user_id, 'debit', _total, _wallet.total_balance - _total, 'withdrawal_settlement', 'withdrawal', _withdrawal.id, 'Provider payout successful');
      UPDATE public.withdrawal_requests SET status = 'successful' WHERE id = _withdrawal.id;
      UPDATE public.transactions SET status = 'completed' WHERE id = _provider_tx.internal_transaction_id;
    ELSE
      UPDATE public.wallets SET available_balance = available_balance + _total, locked_balance = locked_balance - _total, last_updated = now()
      WHERE id = _wallet.id AND locked_balance >= _total;
      IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal hold is inconsistent'; END IF;
      INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
      VALUES (_wallet.id, _provider_tx.user_id, 'credit', _total, _wallet.total_balance, 'withdrawal_release', 'withdrawal', _withdrawal.id, 'Provider payout failed');
      UPDATE public.withdrawal_requests SET status = 'failed' WHERE id = _withdrawal.id;
      UPDATE public.transactions SET status = 'failed' WHERE id = _provider_tx.internal_transaction_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported provider transaction kind';
  END IF;

  UPDATE public.provider_transactions SET
    status = _status,
    provider_reference = coalesce(_provider_reference, provider_reference),
    response_payload = _response,
    processed_at = now(),
    attempts = attempts + 1
  WHERE id = _provider_tx.id;
END;
$$;
REVOKE ALL ON FUNCTION public.settle_provider_transaction(uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_provider_transaction(uuid, text, text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.initiate_service_purchase(
  _service public.provider_service_kind,
  _country_code text,
  _amount numeric,
  _recipient text,
  _product_code text,
  _idempotency_key text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _country public.countries%ROWTYPE;
  _provider uuid;
  _provider_tx uuid;
  _transaction_id uuid;
  _wallet public.wallets%ROWTYPE;
  _wallet_amount numeric;
  _tx_type public.tx_type;
  _key text;
BEGIN
  IF _user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _service NOT IN ('airtime', 'data', 'bill', 'electricity', 'cable', 'education') THEN RAISE EXCEPTION 'Unsupported service'; END IF;
  IF _amount IS NULL OR _amount <= 0 OR scale(_amount) > 2 THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  IF nullif(trim(_recipient), '') IS NULL OR length(_recipient) > 120 THEN RAISE EXCEPTION 'Invalid recipient'; END IF;
  IF nullif(trim(_idempotency_key), '') IS NULL OR length(_idempotency_key) > 100 THEN RAISE EXCEPTION 'Idempotency key is required'; END IF;
  _key := 'purchase:' || _user || ':' || trim(_idempotency_key);
  SELECT id INTO _provider_tx FROM public.provider_transactions WHERE idempotency_key = _key AND user_id = _user;
  IF _provider_tx IS NOT NULL THEN RETURN _provider_tx; END IF;

  SELECT * INTO _country FROM public.countries WHERE code = upper(_country_code) AND status = 'active';
  IF _country.id IS NULL OR _country.fx_to_smk <= 0 THEN RAISE EXCEPTION 'Country or exchange rate is unavailable'; END IF;
  _wallet_amount := round(_amount * _country.fx_to_smk, 2);
  IF _wallet_amount <= 0 THEN RAISE EXCEPTION 'Converted amount is too small'; END IF;
  PERFORM public.enforce_kyc_limit(_user, _wallet_amount, 'purchase');
  SELECT provider_id INTO _provider FROM public.resolve_provider(_service, _country.code) LIMIT 1;
  IF _provider IS NULL THEN RAISE EXCEPTION 'No active provider route'; END IF;

  _tx_type := CASE WHEN _service IN ('airtime', 'data') THEN _service::text::public.tx_type ELSE 'bill'::public.tx_type END;
  INSERT INTO public.transactions(user_id, type, title, description, amount, currency, recipient, status)
  VALUES (_user, _tx_type, initcap(_service::text) || ' purchase', _product_code, _wallet_amount, 'SMK', _recipient, 'pending')
  RETURNING id INTO _transaction_id;
  INSERT INTO public.provider_transactions(
    user_id, provider_id, internal_transaction_id, service_kind, direction, amount, wallet_amount,
    fx_rate, currency_code, country_code, idempotency_key, client_reference, status, request_payload
  ) VALUES (
    _user, _provider, _transaction_id, _service, 'outbound', _amount, _wallet_amount,
    _country.fx_to_smk, _country.currency_code, _country.code, _key, 'PUR-' || _transaction_id, 'pending',
    jsonb_build_object('recipient', _recipient, 'product_code', _product_code)
  ) RETURNING id INTO _provider_tx;

  SELECT * INTO _wallet FROM public.wallets WHERE user_id = _user AND currency_type = 'SMAI_SIKA' FOR UPDATE;
  UPDATE public.wallets SET available_balance = available_balance - _wallet_amount,
    locked_balance = locked_balance + _wallet_amount, last_updated = now()
  WHERE id = _wallet.id AND available_balance >= _wallet_amount;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient available balance'; END IF;
  INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
  VALUES (_wallet.id, _user, 'debit', _wallet_amount, _wallet.total_balance, 'purchase_hold', 'provider_transaction', _provider_tx, 'Funds held for provider purchase');
  RETURN _provider_tx;
END;
$$;
REVOKE ALL ON FUNCTION public.initiate_service_purchase(public.provider_service_kind, text, numeric, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.initiate_service_purchase(public.provider_service_kind, text, numeric, text, text, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.finalize_service_purchase(
  _provider_transaction_id uuid,
  _status text,
  _provider_reference text DEFAULT NULL,
  _response jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _provider_tx public.provider_transactions%ROWTYPE;
  _wallet public.wallets%ROWTYPE;
BEGIN
  IF _status NOT IN ('successful', 'failed') THEN RAISE EXCEPTION 'Invalid final status'; END IF;
  SELECT * INTO _provider_tx FROM public.provider_transactions WHERE id = _provider_transaction_id FOR UPDATE;
  IF _provider_tx.id IS NULL OR _provider_tx.service_kind NOT IN ('airtime', 'data', 'bill', 'electricity', 'cable', 'education') THEN RAISE EXCEPTION 'Purchase transaction not found'; END IF;
  IF _provider_tx.status = _status THEN RETURN; END IF;
  IF _provider_tx.status NOT IN ('pending', 'processing', 'requires_review') THEN RAISE EXCEPTION 'Purchase is already final'; END IF;
  SELECT * INTO _wallet FROM public.wallets WHERE user_id = _provider_tx.user_id AND currency_type = 'SMAI_SIKA' FOR UPDATE;

  IF _status = 'successful' THEN
    UPDATE public.wallets SET locked_balance = locked_balance - _provider_tx.wallet_amount,
      total_balance = total_balance - _provider_tx.wallet_amount, last_updated = now()
    WHERE id = _wallet.id AND locked_balance >= _provider_tx.wallet_amount;
    IF NOT FOUND THEN RAISE EXCEPTION 'Purchase hold is inconsistent'; END IF;
    INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
    VALUES (_wallet.id, _provider_tx.user_id, 'debit', _provider_tx.wallet_amount, _wallet.total_balance - _provider_tx.wallet_amount, 'purchase_settlement', 'provider_transaction', _provider_tx.id, 'Provider purchase successful');
    UPDATE public.transactions SET status = 'completed' WHERE id = _provider_tx.internal_transaction_id;
  ELSE
    UPDATE public.wallets SET available_balance = available_balance + _provider_tx.wallet_amount,
      locked_balance = locked_balance - _provider_tx.wallet_amount, last_updated = now()
    WHERE id = _wallet.id AND locked_balance >= _provider_tx.wallet_amount;
    IF NOT FOUND THEN RAISE EXCEPTION 'Purchase hold is inconsistent'; END IF;
    INSERT INTO public.wallet_ledger(wallet_id, user_id, direction, amount, balance_after, category, reference_type, reference_id, description)
    VALUES (_wallet.id, _provider_tx.user_id, 'credit', _provider_tx.wallet_amount, _wallet.total_balance, 'purchase_release', 'provider_transaction', _provider_tx.id, 'Provider purchase failed');
    UPDATE public.transactions SET status = 'failed' WHERE id = _provider_tx.internal_transaction_id;
  END IF;
  UPDATE public.provider_transactions SET status = _status, provider_reference = coalesce(_provider_reference, provider_reference), response_payload = _response, processed_at = now() WHERE id = _provider_tx.id;
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_service_purchase(uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_service_purchase(uuid, text, text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_replay_webhook(_webhook_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _webhook public.provider_webhooks%ROWTYPE;
  _provider public.providers%ROWTYPE;
  _provider_tx public.provider_transactions%ROWTYPE;
  _account public.virtual_accounts%ROWTYPE;
  _status text;
  _settlement_status text;
  _provider_reference text;
BEGIN
  IF _admin IS NULL OR NOT (public.has_role(_admin, 'admin') OR public.has_role(_admin, 'super_admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT * INTO _webhook FROM public.provider_webhooks WHERE id = _webhook_id FOR UPDATE;
  IF _webhook.id IS NULL OR NOT coalesce(_webhook.signature_valid, false) THEN RAISE EXCEPTION 'Verified webhook not found'; END IF;
  IF _webhook.status NOT IN ('failed', 'processed') THEN RAISE EXCEPTION 'Webhook is not replayable'; END IF;
  SELECT * INTO _provider FROM public.providers WHERE id = _webhook.provider_id;
  IF coalesce((_provider.config->'webhook'->>'trust_signed_webhook_for_settlement')::boolean, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Provider API verification or explicit signed-webhook trust is required';
  END IF;

  _provider_reference := _webhook.normalized_event->>'provider_reference';
  _status := lower(coalesce(_webhook.normalized_event->>'status', ''));
  IF coalesce(_provider.config->'webhook'->'successful_statuses', '["success","successful","completed"]'::jsonb) ? _status THEN
    _settlement_status := 'successful';
  ELSIF coalesce(_provider.config->'webhook'->'failed_statuses', '["failed","failure"]'::jsonb) ? _status THEN
    _settlement_status := 'failed';
  ELSE
    RAISE EXCEPTION 'Provider status is not mapped';
  END IF;

  SELECT * INTO _provider_tx FROM public.provider_transactions
  WHERE provider_id = _provider.id AND provider_reference = _provider_reference FOR UPDATE;
  IF _provider_tx.id IS NULL AND nullif(_webhook.normalized_event->>'account_number', '') IS NOT NULL THEN
    SELECT * INTO _account FROM public.virtual_accounts
    WHERE provider_id = _provider.id
      AND account_number = _webhook.normalized_event->>'account_number'
      AND status = 'active';
    IF _account.id IS NOT NULL THEN
      INSERT INTO public.provider_transactions(
        user_id, provider_id, service_kind, direction, amount, wallet_amount, fx_rate, currency_code, country_code,
        idempotency_key, provider_reference, client_reference, status, response_payload
      ) VALUES (
        _account.user_id, _provider.id, 'deposit', 'inbound', (_webhook.normalized_event->>'amount')::numeric,
        round((_webhook.normalized_event->>'amount')::numeric * c.fx_to_smk, 2), c.fx_to_smk,
        _webhook.normalized_event->>'currency', _account.country_code, _webhook.idempotency_key,
        coalesce(_provider_reference, _webhook.idempotency_key), 'DEP-' || _webhook.id, 'processing', _webhook.payload
      FROM public.countries c WHERE c.code = _account.country_code AND c.fx_to_smk > 0
      RETURNING * INTO _provider_tx;
    END IF;
  END IF;
  IF _provider_tx.id IS NULL THEN RAISE EXCEPTION 'Provider transaction mapping not found'; END IF;
  UPDATE public.provider_transactions SET status = 'processing' WHERE id = _provider_tx.id AND status = 'requires_review';
  PERFORM public.settle_provider_transaction(_provider_tx.id, _provider_reference, _settlement_status, _webhook.payload);
  UPDATE public.provider_webhooks SET status = 'processed', error = NULL, processed_at = now(), attempts = attempts + 1 WHERE id = _webhook.id;
  UPDATE public.webhook_dead_letters SET resolved_at = now(), replayed_by = _admin, replayed_at = now() WHERE webhook_id = _webhook.id;
  INSERT INTO public.audit_logs(admin_id, action_type, target_type, target_id, after_state)
  VALUES (_admin, 'webhook_replay', 'provider_webhook', _webhook.id::text, jsonb_build_object('provider_transaction_id', _provider_tx.id, 'status', _settlement_status));
END;
$$;
REVOKE ALL ON FUNCTION public.admin_replay_webhook(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_replay_webhook(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_provider_transactions(_limit integer DEFAULT 25)
RETURNS SETOF public.provider_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT id FROM public.provider_transactions
    WHERE status = 'pending' AND direction = 'outbound' AND attempts < 5
    ORDER BY created_at
    LIMIT least(greatest(_limit, 1), 100)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.provider_transactions pt
  SET status = 'processing', attempts = pt.attempts + 1, updated_at = now()
  FROM claimed
  WHERE pt.id = claimed.id
  RETURNING pt.*;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_provider_transactions(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_provider_transactions(integer) TO service_role;
