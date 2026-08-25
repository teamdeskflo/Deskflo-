import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE } from '@/lib/admin/auth';
import { hasPermission } from '@/lib/admin/rbac';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session || !hasPermission(session.admin.role, 'view_approvals')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') ?? 'all'; // all | approved | rejected | viewed
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '25');
  const offset = (page - 1) * limit;

  const db = createAdminClient() as any;

  let query = db
    .from('approval_logs')
    .select(`
      id, action, ip_address, user_agent, created_at,
      files(file_name, file_url, project_id, projects(name, freelancer_id, users(name))),
      clients(name, company_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action !== 'all') {
    query = query.eq('action', action);
  }

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ approvals: data, total: count, page, limit });
}
