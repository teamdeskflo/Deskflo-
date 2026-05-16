import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/files?project_id=xxx ────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('files')
      .select(`
        *,
        shared_links(id, type, slug, clicks),
        projects!inner(id, client_id, clients!inner(freelancer_id))
      `)
      .eq('projects.clients.freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/files — register file + generate approval link ─
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { project_id, file_name, file_url, file_size, file_type, is_open_file } = body;
    if (!project_id || !file_name || !file_url) {
      return NextResponse.json({ error: 'project_id, file_name, and file_url are required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select(`id, clients!inner(freelancer_id)`)
      .eq('id', project_id)
      .eq('clients.freelancer_id', freelancerId)
      .single();

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Insert file record
    const { data: file, error: fileError } = await supabase
      .from('files')
      .insert({ project_id, file_name, file_url, file_size, file_type, is_open_file: is_open_file || false })
      .select()
      .single();

    if (fileError) throw fileError;

    // Auto-generate an approval link
    const { data: link, error: linkError } = await supabase
      .from('shared_links')
      .insert({ file_id: file.id, type: 'approval' })
      .select()
      .single();

    if (linkError) throw linkError;

    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve/${link.slug}`;

    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      project_id,
      action: 'file_uploaded',
      metadata: { file_name, approval_slug: link.slug },
    });

    return NextResponse.json({ ...file, approvalUrl, slug: link.slug }, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
