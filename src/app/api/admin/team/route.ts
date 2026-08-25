import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE, logAdminAction } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createAdminClient() as any;
  const { data: team, error } = await db
    .from('admin_users')
    .select('id, email, name, role, is_active, created_at, last_login_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ team });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const allowedRoles = ['super_admin', 'support', 'finance', 'operations'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const db = createAdminClient() as any;

  const { data: newAdmin, error } = await db
    .from('admin_users')
    .insert({
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      is_active: true,
    })
    .select('id, name, email, role, is_active')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: 'create_admin',
    targetType: 'admin_user',
    targetId: newAdmin.id,
    metadata: { email: newAdmin.email, role: newAdmin.role },
    ipAddress: ip,
  });

  return NextResponse.json({ admin: newAdmin });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_team')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  // Prevent self deletion
  if (id === session.admin.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const db = createAdminClient() as any;
  const { error } = await db.from('admin_users').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: 'delete_admin',
    targetType: 'admin_user',
    targetId: id,
    ipAddress: ip,
  });

  return NextResponse.json({ success: true });
}
