import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { title, description, priority, is_completed, due_date, project_id } = body;

    const { data, error } = await supabase
      .from('tasks')
      .update({ title, description, priority, is_completed, due_date, project_id })
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('freelancer_id', freelancerId);

    if (error) throw error;
    return NextResponse.json({ message: 'Task deleted' });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
