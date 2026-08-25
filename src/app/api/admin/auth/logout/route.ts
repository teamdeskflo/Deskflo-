import { NextRequest, NextResponse } from 'next/server';
import { invalidateAdminSession, validateAdminToken, logAdminAction, ADMIN_SESSION_COOKIE } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const ip    = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (token) {
    const session = await validateAdminToken(token);
    if (session) {
      await logAdminAction({
        adminId:    session.admin.id,
        adminEmail: session.admin.email,
        action:     'logout',
        ipAddress:  ip,
      });
    }
    await invalidateAdminSession(token);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   0,
  });
  return response;
}
