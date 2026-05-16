import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/tasks ────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { searchParams } = new URL(request.url);
    const projectId   = searchParams.get('project_id');
    const completed   = searchParams.get('completed');
    const priority    = searchParams.get('priority');

    let query = supabase
      .from('tasks')
      .select(`*, projects(id, name)`)
      .eq('freelancer_id', freelancerId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (projectId)           query = query.eq('project_id', projectId);
    if (completed !== null)  query = query.eq('is_completed', completed === 'true');
    if (priority)            query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/tasks ───────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { title, description, project_id, priority, due_date } = body;
    if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        freelancer_id: freelancerId,
        title, description,
        project_id: project_id || null,
        priority: priority || 'medium',
        due_date: due_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
