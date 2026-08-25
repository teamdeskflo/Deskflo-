import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken, ADMIN_SESSION_COOKIE } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await validateAdminToken(token);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createAdminClient() as any;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: pendingApprovals },
    { count: totalInvoices },
    { count: newSignups },
    { count: waitlistCount },
    { data: revenueData },
  ] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('projects').select('*', { count: 'exact', head: true }),
    db.from('files').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    db.from('invoices').select('*', { count: 'exact', head: true }),
    db.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    db.from('waitlist').select('*', { count: 'exact', head: true }),
    db.from('invoices').select('total_amount').eq('status', 'paid'),
  ]);

  const totalRevenue = (revenueData ?? []).reduce((sum: number, r: any) => sum + (Number(r?.total_amount) || 0), 0);

  return NextResponse.json({
    totalUsers:       totalUsers    ?? 0,
    totalProjects:    totalProjects ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    totalInvoices:    totalInvoices ?? 0,
    newSignups:       newSignups    ?? 0,
    waitlistCount:    waitlistCount ?? 0,
    totalRevenue,
  });
}
