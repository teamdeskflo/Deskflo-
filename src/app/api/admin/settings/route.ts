import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE, logAdminAction } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';

// Mock in-memory state (gets reset on app restarts, but is perfect for demo/static configs)
let mockSettings = {
  registration_open: true,
  waitlist_enabled: true,
  support_email: 'support@deskflo.in',
  maintenance_mode: false,
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_settings')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ settings: mockSettings });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_settings')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { registration_open, waitlist_enabled, support_email, maintenance_mode } = body;

  if (typeof registration_open === 'boolean') mockSettings.registration_open = registration_open;
  if (typeof waitlist_enabled === 'boolean') mockSettings.waitlist_enabled = waitlist_enabled;
  if (typeof maintenance_mode === 'boolean') mockSettings.maintenance_mode = maintenance_mode;
  if (support_email) mockSettings.support_email = support_email;

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: 'update_platform_settings',
    targetType: 'setting',
    metadata: mockSettings,
    ipAddress: ip,
  });

  return NextResponse.json({ settings: mockSettings });
}
