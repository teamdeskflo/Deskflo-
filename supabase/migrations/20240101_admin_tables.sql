-- ══════════════════════════════════════════════════════════════════════
-- Admin Panel Tables Migration
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════

-- Admin Users (completely separate from freelancer `users` table)
CREATE TABLE IF NOT EXISTS admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'support'
                    CHECK (role IN ('super_admin','support','finance','operations')),
  totp_secret     TEXT,
  totp_enabled    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  failed_logins   INT DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  last_login_at   TIMESTAMPTZ,
  last_login_ip   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Admin Sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  ip_address  TEXT,
  user_agent  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Admin Activity / Audit Log
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_email  TEXT,                        -- denormalized for log durability
  action       TEXT NOT NULL,
  target_type  TEXT,                        -- 'user','invoice','file','setting', etc.
  target_id    TEXT,
  metadata     JSONB,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token    ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires  ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin    ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created  ON admin_activity_logs(created_at DESC);

-- ── RLS — Disabled for admin tables (accessed via service role only) ────────
ALTER TABLE admin_users          DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs  DISABLE ROW LEVEL SECURITY;

-- ── Seed: first Super Admin ────────────────────────────────────────────────
-- IMPORTANT: Replace the password hash below.
-- Generate with: node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('YourPassword123!', 12).then(console.log)"
-- INSERT INTO admin_users (email, password_hash, name, role)
-- VALUES ('admin@deskflo.in', '<BCRYPT_HASH_HERE>', 'Super Admin', 'super_admin');
