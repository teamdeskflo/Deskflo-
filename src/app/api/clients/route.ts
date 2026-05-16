import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/clients — list all clients ──────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';

    let query = supabase
      .from('clients')
      .select(`
        *,
        projects(id, status)
      `)
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enrich with project counts
    const enriched = data.map(c => ({
      ...c,
      activeProjects:    (c.projects as { status: string }[]).filter(p => p.status === 'active').length,
      completedProjects: (c.projects as { status: string }[]).filter(p => p.status === 'completed').length,
      projects: undefined,
    }));

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/clients — create client ────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { name, email, phone, company_name } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({ freelancer_id: freelancerId, name, email, phone, company_name })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      action: 'client_created',
      metadata: { client_name: name, client_email: email },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
