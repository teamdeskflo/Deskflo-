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
    if (status)   query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
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

    const { data, error } = await supabase
      .from('projects')
      .insert({ client_id, name, description, status: status || 'active', budget, deadline })
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
