import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  createAdminSession,
  recordFailedLogin,
  clearFailedLogins,
  logAdminAction,
  ADMIN_SESSION_COOKIE,
  SESSION_DURATION_MS,
} from '@/lib/admin/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const userAgent = request.headers.get('user-agent') ?? '';

    // ⚠️ TEMPORARY DEBUG BYPASS — DELETE BEFORE LAUNCH ⚠️
    if (email === 'team.deskflo@gmail.com' && password === 'UditAaru') {
      const response = NextResponse.json({
        ok: true,
        admin: { id: 'temp-bypass', email, name: 'Temp Admin', role: 'super_admin' },
      });
      response.cookies.set(ADMIN_SESSION_COOKIE, 'temp-bypass-token-12345', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_MS / 1000,
      });
      return response;
    }
    // ⚠️ END TEMPORARY BYPASS ⚠️

    const db = createAdminClient() as any;

    // ── Lookup admin by email ──────────────────────────────────────────────
    const { data: admin, error: dbErr } = await db
      .from('admin_users')
      .select('id, email, name, role, password_hash, is_active, failed_logins, locked_until, totp_enabled, totp_secret')
      .eq('email', email.toLowerCase().trim())
      .single();

    const badCredentials = NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );

    if (dbErr || !admin) {
      return badCredentials;
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account suspended. Contact super admin.' }, { status: 403 });
    }

    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      const remainMins = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account locked. Try again in ${remainMins} minute${remainMins === 1 ? '' : 's'}.` },
        { status: 429 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      const { locked } = await recordFailedLogin(email);
      if (locked) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Account locked for 15 minutes.' },
          { status: 429 }
        );
      }
      const remaining = Math.max(0, 5 - ((admin.failed_logins ?? 0) + 1));
      return NextResponse.json(
        { error: `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 401 }
      );
    }

    await clearFailedLogins(admin.id);
    await db.from('admin_users').update({ last_login_ip: ip }).eq('id', admin.id);

    const token = await createAdminSession(admin.id, ip, userAgent);

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'login',
      ipAddress: ip,
    });

    const response = NextResponse.json({
      ok: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    });

    return response;
  } catch (err: unknown) {
    console.error('[admin login]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}