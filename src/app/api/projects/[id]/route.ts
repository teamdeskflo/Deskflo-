import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients!inner(id, name, email, freelancer_id),
        files(*),
        tasks(*)
      `)
      .eq('id', id)
      .eq('clients.freelancer_id', freelancerId)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    // Verify ownership via clients join
    const { data: existing } = await supabase
      .from('projects')
      .select(`id, clients!inner(freelancer_id)`)
      .eq('id', id)
      .eq('clients.freelancer_id', freelancerId)
      .single();

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { name, description, status, budget, deadline } = body;
    const { data, error } = await supabase
      .from('projects')
      .update({ name, description, status, budget, deadline })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { data: existing } = await supabase
      .from('projects')
      .select(`id, clients!inner(freelancer_id)`)
      .eq('id', id)
      .eq('clients.freelancer_id', freelancerId)
      .single();

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ message: 'Project deleted' });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
