-- ============================================================
-- DESKFLO — 90-Day Grace Period Cleanup Job
-- ============================================================
-- REQUIREMENTS:
--   • pg_cron extension must be enabled on your Supabase project
--     (available on Pro plan: Database → Extensions → pg_cron)
--   • ON DELETE CASCADE must be set on all child tables that
--     reference public.users(id) — invoices, projects, files, etc.
--     This script includes a safety check before enabling cron.
-- ============================================================
-- HOW TO RUN:
--   Paste the entire script into Supabase → SQL Editor → Run
-- ============================================================

-- STEP 1: Enable pg_cron extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- STEP 2: Create the deletion function
-- This function:
--   a) Logs accounts it is about to delete (for audit trail)
--   b) Deletes auth.users rows — which cascades to public.users
--      (Supabase's auth schema → public.users via FK trigger)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deletion_audit_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_user_id UUID        NOT NULL,
  deleted_email   TEXT,
  deleted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason          TEXT        NOT NULL DEFAULT '90-day-grace-period-expired'
);

CREATE OR REPLACE FUNCTION public.cleanup_expired_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_user RECORD;
BEGIN
  -- Find all users whose subscription expired > 90 days ago
  -- subscription_status = 'expired' is set by Razorpay webhook on autopay failure
  -- OR trial users who never added a payment method and their trial ended > 90 days ago
  FOR expired_user IN
    SELECT id, email
    FROM public.users
    WHERE (
      -- Case 1: Subscription expired (autopay failure) and 90-day grace window is up
      (subscription_status = 'expired' AND next_billing_date < NOW() - INTERVAL '90 days')
      OR
      -- Case 2: Trial ended without a payment method and 90 days have passed
      (subscription_status = 'trial' AND payment_method_added = false AND trial_ends_at < NOW() - INTERVAL '90 days')
    )
  LOOP
    -- Write to audit log BEFORE deleting (irreversible action)
    INSERT INTO public.deletion_audit_log (deleted_user_id, deleted_email, reason)
    VALUES (expired_user.id, expired_user.email, '90-day-grace-period-expired');

    -- Delete from auth.users — Supabase cascades this to public.users
    -- and all child tables with ON DELETE CASCADE foreign keys
    DELETE FROM auth.users WHERE id = expired_user.id;

    RAISE LOG 'DESKFLO CLEANUP: Permanently deleted user % (%) — 90-day grace period expired.', 
      expired_user.id, expired_user.email;
  END LOOP;
END;
$$;

-- ============================================================
-- STEP 3: Register the nightly cron job (runs at 02:00 UTC daily)
-- ============================================================
SELECT cron.schedule(
  'deskflo-cleanup-expired-accounts',   -- job name (unique)
  '0 2 * * *',                          -- cron expression: 02:00 UTC every day
  $$ SELECT public.cleanup_expired_accounts(); $$
);

-- ============================================================
-- STEP 4: Verify the job was registered
-- ============================================================
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'deskflo-cleanup-expired-accounts';


-- ============================================================
-- OPTIONAL: Manual test run (does NOT delete anything — dry run)
-- Uncomment and run to see which accounts WOULD be deleted.
-- ============================================================
/*
SELECT id, email, subscription_status, trial_ends_at, next_billing_date, payment_method_added
FROM public.users
WHERE (
  (subscription_status = 'expired' AND next_billing_date < NOW() - INTERVAL '90 days')
  OR
  (subscription_status = 'trial' AND payment_method_added = false AND trial_ends_at < NOW() - INTERVAL '90 days')
);
*/


-- ============================================================
-- OPTIONAL: Cancel the job if you ever need to disable it
-- ============================================================
-- SELECT cron.unschedule('deskflo-cleanup-expired-accounts');
