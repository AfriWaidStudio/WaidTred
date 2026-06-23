ALTER TYPE public.tx_type ADD VALUE IF NOT EXISTS 'withdrawal';
ALTER TYPE public.tx_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE public.tx_status ADD VALUE IF NOT EXISTS 'successful';
ALTER TYPE public.tx_status ADD VALUE IF NOT EXISTS 'refunded';

