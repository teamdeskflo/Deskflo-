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

    // Map database status back to frontend status
    let frontendStatus = 'progress';
    if (data.status === 'completed') frontendStatus = 'approved';
    else if (data.status === 'on_hold' || data.status === 'cancelled') frontendStatus = 'pending';
    else if (data.status === 'active') {
      const hasUnapproved = Array.isArray(data.files) && data.files.some((f: any) => !f.is_approved);
      if (hasUnapproved) frontendStatus = 'review';
      else frontendStatus = 'progress';
    }
    const formatted = { ...data, status: frontendStatus };

    return NextResponse.json(formatted);
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
    const cleanDeadline = (deadline && typeof deadline === 'string' && deadline.trim() !== '') ? deadline : null;
    const cleanBudget = (budget !== undefined && budget !== null && budget !== '') ? parseFloat(budget) : null;

    let dbStatus = 'active';
    if (status === 'approved') dbStatus = 'completed';
    else if (status === 'pending') dbStatus = 'on_hold';
    else if (status === 'progress' || status === 'review') dbStatus = 'active';

    const { data, error } = await supabase
      .from('projects')
      .update({ 
        name, 
        description, 
        status: dbStatus, 
        budget: cleanBudget, 
        deadline: cleanDeadline 
      })
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
