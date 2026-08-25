import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE, logAdminAction } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'view_waitlist')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '25');
  const offset = (page - 1) * limit;

  const db = createAdminClient() as any;

  let query = db
    .from('waitlist')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ waitlist: data, total: count, page, limit });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'manage_waitlist')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const db = createAdminClient() as any;
  const { error } = await db.from('waitlist').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log action
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  await logAdminAction({
    adminId: session.admin.id,
    adminEmail: session.admin.email,
    action: 'delete_waitlist_entry',
    targetType: 'waitlist',
    targetId: id,
    ipAddress: ip,
  });

  return NextResponse.json({ success: true });
}
