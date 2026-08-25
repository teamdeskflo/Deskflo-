// ─── Admin Auth Utilities ──────────────────────────────────────────────────
// All admin auth runs via service-role Supabase client (bypasses RLS).
// Passwords are hashed with bcryptjs. Sessions stored in admin_sessions table.

import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { AdminRole } from './rbac';

// ── Constants ──────────────────────────────────────────────────────────────
export const ADMIN_SESSION_COOKIE = 'deskflo_admin_session';
export const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_FAILED_LOGINS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 min lockout

// ── Types ──────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  totp_enabled: boolean;
  is_active: boolean;
}

export interface AdminSession {
  admin: AdminUser;
  sessionId: string;
  expiresAt: string;
}

// ── Token generation ───────────────────────────────────────────────────────
function generateToken(): string {
  const array = new Uint8Array(48);
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(array);
  }
  return Buffer.from(array).toString('hex');
}

function getAdminDb() {
  return createAdminClient() as any;
}

// ── Create session ─────────────────────────────────────────────────────────
export async function createAdminSession(
  adminId: string,
  ipAddress: string,
  userAgent: string
): Promise<string> {
  const db = getAdminDb();
  const token = generateToken();
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  await db.from('admin_sessions').insert({
    admin_id: adminId,
    token,
    ip_address: ipAddress,
    user_agent: userAgent,
    expires_at: expires,
  });

  return token;
}

// ── Validate token directly ────────────────────────────────────────────────
export async function validateAdminToken(token: string): Promise<AdminSession | null> {
  try {
    // ⚠️ TEMPORARY DEBUG BYPASS — DELETE BEFORE LAUNCH ⚠️
    if (token === 'temp-bypass-token-12345') {
      return {
        admin: {
          id: 'temp-bypass',
          email: 'team.deskflo@gmail.com',
          name: 'Temp Admin',
          role: 'super_admin',
          totp_enabled: false,
          is_active: true,
        },
        sessionId: 'temp-bypass',
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      };
    }
    // ⚠️ END TEMPORARY BYPASS ⚠️

    const db = getAdminDb();

    const { data: session, error } = await db
      .from('admin_sessions')
      .select(`
        id, expires_at,
        admin_users!inner(id, email, name, role, totp_enabled, is_active)
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) return null;

    const admin = Array.isArray(session.admin_users)
      ? session.admin_users[0]
      : session.admin_users as unknown as AdminUser;

    if (!admin || !admin.is_active) return null;

    // Slide expiry — refresh session on every validated request
    await db
      .from('admin_sessions')
      .update({ expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString() })
      .eq('id', session.id);

    return {
      admin: admin as AdminUser,
      sessionId: session.id,
      expiresAt: session.expires_at,
    };
  } catch {
    return null;
  }
}
// ── Invalidate session ─────────────────────────────────────────────────────
export async function invalidateAdminSession(token: string): Promise<void> {
  const db = getAdminDb();
  await db.from('admin_sessions').delete().eq('token', token);
}

// ── Log admin action ───────────────────────────────────────────────────────
export async function logAdminAction(params: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    const db = getAdminDb();
    await db.from('admin_activity_logs').insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action: params.action,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? null,
      ip_address: params.ipAddress ?? null,
    });
  } catch {
    // Non-fatal — don't break the request if logging fails
  }
}

// ── Track failed login ─────────────────────────────────────────────────────
export async function recordFailedLogin(email: string): Promise<{ locked: boolean }> {
  const db = getAdminDb();

  const { data: admin } = await db
    .from('admin_users')
    .select('id, failed_logins')
    .eq('email', email)
    .single();

  if (!admin) return { locked: false };

  const newCount = (admin.failed_logins ?? 0) + 1;
  const updates: Record<string, unknown> = { failed_logins: newCount };

  if (newCount >= MAX_FAILED_LOGINS) {
    updates.locked_until = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  }

  await db.from('admin_users').update(updates).eq('id', admin.id);
  return { locked: newCount >= MAX_FAILED_LOGINS };
}

// ── Clear failed logins on successful auth ─────────────────────────────────
export async function clearFailedLogins(adminId: string): Promise<void> {
  const db = getAdminDb();
  await db
    .from('admin_users')
    .update({ failed_logins: 0, locked_until: null, last_login_at: new Date().toISOString() })
    .eq('id', adminId);
}
