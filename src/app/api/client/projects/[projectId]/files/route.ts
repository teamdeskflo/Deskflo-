import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('client_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized: No session token found' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Fetch and validate session
    const { data: session, error: sessionErr } = await supabase
      .from('client_sessions')
      .select('*')
      .eq('token', sessionToken)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Unauthorized: Session expired' }, { status: 401 });
    }

    // 2. Fetch project and verify it belongs to this client
    const { data: project, error: projectErr } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single();

    if (projectErr || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.client_id !== session.client_id) {
      return NextResponse.json({ error: 'Unauthorized: Project does not belong to you' }, { status: 403 });
    }

    // 3. Fetch files for this project
    const { data: files, error: filesErr } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (filesErr) throw filesErr;

    return NextResponse.json({ files });
  } catch (err: unknown) {
    console.error('Client project files fetch error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
