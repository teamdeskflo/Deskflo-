import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/projects ─────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const status   = searchParams.get('status');

    let query = supabase
      .from('projects')
      .select(`
        *,
        clients!inner(id, name, email, freelancer_id),
        files(id, is_approved),
        tasks(id, is_completed)
      `)
      .eq('clients.freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (clientId) query = query.eq('client_id', clientId);
    if (status) {
      let dbFilterStatus = 'active';
      if (status === 'approved') dbFilterStatus = 'completed';
      else if (status === 'pending') dbFilterStatus = 'on_hold';
      else if (status === 'progress' || status === 'review') dbFilterStatus = 'active';
      query = query.eq('status', dbFilterStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Map database status back to frontend status
    const formatted = (data || []).map((p: any) => {
      let frontendStatus = 'progress';
      if (p.status === 'completed') frontendStatus = 'approved';
      else if (p.status === 'on_hold' || p.status === 'cancelled') frontendStatus = 'pending';
      else if (p.status === 'active') {
        const hasUnapproved = Array.isArray(p.files) && p.files.some((f: any) => !f.is_approved);
        if (hasUnapproved) frontendStatus = 'review';
        else frontendStatus = 'progress';
      }
      return { ...p, status: frontendStatus };
    });

    return NextResponse.json(formatted);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/projects ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { client_id, name, description, status, budget, deadline } = body;
    if (!client_id || !name) {
      return NextResponse.json({ error: 'client_id and name are required' }, { status: 400 });
    }

    // Verify client belongs to this freelancer
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('id', client_id)
      .eq('freelancer_id', freelancerId)
      .single();

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const cleanDeadline = (deadline && typeof deadline === 'string' && deadline.trim() !== '') ? deadline : null;
    const cleanBudget = (budget !== undefined && budget !== null && budget !== '') ? parseFloat(budget) : null;

    let dbStatus = 'active';
    if (status === 'approved') dbStatus = 'completed';
    else if (status === 'pending') dbStatus = 'on_hold';
    else if (status === 'progress' || status === 'review') dbStatus = 'active';

    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        client_id, 
        name, 
        description, 
        status: dbStatus, 
        budget: cleanBudget, 
        deadline: cleanDeadline 
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      project_id: data.id,
      action: 'project_created',
      metadata: { project_name: name, client_id },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
