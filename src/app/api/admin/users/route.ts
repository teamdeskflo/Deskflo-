import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE, logAdminAction } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';
import { createAdminClient } from '@/lib/supabase/server';

// ── GET /api/admin/users — list all freelancer users ──────────────────────
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'view_users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? 'all';   // all | active | suspended
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '25');
  const offset = (page - 1) * limit;

  const db = createAdminClient() as any;

  let query = db
    .from('users')
    .select('id, name, email, company_name, plan, is_active, created_at, brand_color, logo_url', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
  }
  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'suspended') {
    query = query.eq('is_active', false);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: data, total: count, page, limit });
}
