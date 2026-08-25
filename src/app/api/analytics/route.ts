import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/analytics ────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    // Run all queries in parallel for performance
    const [
      invoicesRes,
      clientsRes,
      projectsRes,
      filesRes,
      approvalLogsRes,
      tasksRes,
    ] = await Promise.all([
      supabase
        .from('invoices')
        .select('amount, total_amount, gst_amount, status, paid_at, created_at, client_id')
        .eq('freelancer_id', freelancerId),

      supabase
        .from('clients')
        .select('id, name, created_at')
        .eq('freelancer_id', freelancerId),

      supabase
        .from('projects')
        .select('id, status, created_at, clients!inner(freelancer_id)')
        .eq('clients.freelancer_id', freelancerId),

      supabase
        .from('files')
        .select('id, is_approved, created_at, projects!inner(client_id, clients!inner(freelancer_id))')
        .eq('projects.clients.freelancer_id', freelancerId),

      supabase
        .from('approval_logs')
        .select('id, action, created_at, file_id')
        .order('created_at', { ascending: false })
        .limit(100),

      supabase
        .from('tasks')
        .select('id, is_completed, priority, due_date')
        .eq('freelancer_id', freelancerId),
    ]);

    const invoices: any[] = invoicesRes.data || [];
    const clients: any[]  = clientsRes.data || [];
    const projects: any[] = projectsRes.data || [];
    const files: any[]    = filesRes.data || [];
    const tasks: any[]    = tasksRes.data || [];

    // ── Revenue ─────────────────────────────────────────────
    const totalRevenue   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total_amount, 0);
    const overdueCount   = invoices.filter(i => i.status === 'overdue').length;

    // Monthly revenue for the past 6 months
    const now = new Date();
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const revenue = invoices
        .filter(inv => inv.status === 'paid' && inv.paid_at && new Date(inv.paid_at).getMonth() === d.getMonth() && new Date(inv.paid_at).getFullYear() === d.getFullYear())
        .reduce((s, inv) => s + inv.total_amount, 0);
      monthlyRevenue.push({ month: label, revenue });
    }

    // ── Projects ─────────────────────────────────────────────
    const activeProjects    = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;

    // ── Approval Rate ─────────────────────────────────────────
    const totalFiles    = files.length;
    const approvedFiles = files.filter(f => f.is_approved).length;
    const approvalRate  = totalFiles > 0 ? Math.round((approvedFiles / totalFiles) * 100) : 0;

    // ── Top Clients by revenue ────────────────────────────────
    const clientRevMap: Record<string, number> = {};
    invoices.filter(i => i.status === 'paid').forEach(i => {
      clientRevMap[i.client_id] = (clientRevMap[i.client_id] || 0) + i.total_amount;
    });
    const topClients = clients
      .map(c => ({ ...c, revenue: clientRevMap[c.id] || 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // ── Tasks ─────────────────────────────────────────────────
    const pendingTasks = tasks.filter(t => !t.is_completed).length;
    const overdueTasks = tasks.filter(t => !t.is_completed && t.due_date && new Date(t.due_date) < now).length;

    return NextResponse.json({
      revenue: {
        total:   totalRevenue,
        pending: pendingRevenue,
        overdue: overdueCount,
        monthly: monthlyRevenue,
      },
      projects: {
        total:     projects.length,
        active:    activeProjects,
        completed: completedProjects,
      },
      clients: {
        total: clients.length,
        top:   topClients,
      },
      files: {
        total:        totalFiles,
        approved:     approvedFiles,
        approvalRate,
      },
      tasks: {
        pending: pendingTasks,
        overdue: overdueTasks,
      },
      invoices: {
        total:   invoices.length,
        paid:    invoices.filter(i => i.status === 'paid').length,
        sent:    invoices.filter(i => i.status === 'sent').length,
        overdue: overdueCount,
      },
    });

  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
