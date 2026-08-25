import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE, logAdminAction } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';
import { createAdminClient } from '@/lib/supabase/server';

// ── GET /api/admin/users/[id] — get detailed user info ────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'view_users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = createAdminClient() as any;

  // Get user details
  const { data: user, error: userErr } = await db
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (userErr || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get related stats
  const [
    { data: clients },
    { data: projects },
    { data: invoices },
    { data: activityLogs },
  ] = await Promise.all([
    db.from('clients').select('id, name, email, company_name, created_at').eq('freelancer_id', id),
    db.from('projects').select('id, name, status, budget, deadline, created_at, clients(name)').eq('clients.freelancer_id', id),
    db.from('invoices').select('id, invoice_number, total_amount, status, due_date, created_at').eq('freelancer_id', id),
    db.from('activity_logs').select('id, action, metadata, created_at').eq('freelancer_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  return NextResponse.json({
    user,
    clients: clients ?? [],
    projects: (projects ?? []).filter((p: any) => p.clients !== null),
    invoices: invoices ?? [],
    activityLogs: activityLogs ?? [],
  });
}

// ── PATCH /api/admin/users/[id] — edit user status/plan ───────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'edit_users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const db = createAdminClient() as any;

  const { is_active, subscription_status, billing_plan } = body;

  const updatePayload: any = {};
  if (typeof is_active === 'boolean') updatePayload.is_active = is_active;
  if (subscription_status) updatePayload.subscription_status = subscription_status;
  if (billing_plan) updatePayload.billing_plan = billing_plan;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const { data: updatedUser, error } = await db
    .from('users')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: `update_user_${Object.keys(updatePayload).join('_')}`,
    targetType: 'user',
    targetId: id,
    metadata: updatePayload,
    ipAddress: ip,
  });

  return NextResponse.json({ user: updatedUser });
}

// ── DELETE /api/admin/users/[id] — delete user (super admin only) ─────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'delete_users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = createAdminClient() as any;

  // We should also delete the user from auth.users via admin client if we want complete wipeout
  const { error } = await db.auth.admin.deleteUser(id);
  if (error) {
    // If user doesn't exist in auth, delete from public table
    const { error: dbErr } = await db.from('users').delete().eq('id', id);
    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: 'delete_user',
    targetType: 'user',
    targetId: id,
    ipAddress: ip,
  });

  return NextResponse.json({ success: true });
}
