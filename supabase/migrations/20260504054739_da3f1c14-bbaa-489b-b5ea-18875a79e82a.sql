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
    VALUES (_sender, 'transfer', 'Transfer to ' || COALESCE(_recipient_name,'user'), _description, _amount, 'SMK', _recipient_name, 'completed')
    RETURNING id INTO _tx;
  INSERT INTO transactions(user_id, type, title, description, amount, currency, recipient, status)
    VALUES (_recipient_id, 'received', 'Transfer received', _description, _amount, 'SMK', _recipient_name, 'completed');
  PERFORM process_wallet_movement(_sender, 'debit', _amount, 'transfer_out', _description, 'transaction', _tx);
  PERFORM process_wallet_movement(_recipient_id, 'credit', _amount, 'transfer_in', _description, 'transaction', _tx);
  INSERT INTO notifications(user_id, type, title, body, link)
    VALUES (_recipient_id, 'tx', 'Money received', 'You received ' || _amount || ' Smai Sika', '/dashboard/transactions');
  RETURN _tx;
END $$;