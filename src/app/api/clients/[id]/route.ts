import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/clients/[id] ─────────────────────────────────────
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { data, error } = await supabase
      .from('clients')
      .select(`*, projects(*)`)
      .eq('id', id)
      .eq('freelancer_id', freelancerId)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── PUT /api/clients/[id] ─────────────────────────────────────
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { name, email, phone, company_name, portal_access } = body;

    const { data, error } = await supabase
      .from('clients')
      .update({ name, email, phone, company_name, portal_access })
      .eq('id', id)
      .eq('freelancer_id', freelancerId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── DELETE /api/clients/[id] ──────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('freelancer_id', freelancerId);

    if (error) throw error;
    return NextResponse.json({ message: 'Client deleted' });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
