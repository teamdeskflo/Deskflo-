-- ============================================================
-- DESKFLO — Billing History Table + New user columns
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. New columns on users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_display    TEXT;

-- 2. Billing history table
CREATE TABLE IF NOT EXISTS public.billing_history (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  razorpay_payment_id      TEXT,
  razorpay_subscription_id TEXT,
  plan                     TEXT NOT NULL CHECK (plan IN ('monthly','annual')),
  amount                   NUMERIC(10,2) NOT NULL,
  status                   TEXT NOT NULL CHECK (status IN ('paid','failed','refunded')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_history_owner" ON public.billing_history
  FOR ALL USING (freelancer_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_billing_history_freelancer
  ON public.billing_history(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created
  ON public.billing_history(created_at DESC);
