import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await params;
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

    // 2. Fetch the file and verify project ownership
    const { data: file, error: fileErr } = await supabase
      .from('files')
      .select(`
        *,
        projects!inner(id, client_id)
      `)
      .eq('id', fileId)
      .single();

    if (fileErr || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Type casting project safely
    const project = file.projects as unknown as { id: string; client_id: string };

    if (project.client_id !== session.client_id) {
      return NextResponse.json({ error: 'Unauthorized: File does not belong to your project' }, { status: 403 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    // 3. Update the files table to mark as approved
    const { error: updateErr } = await supabase
      .from('files')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_ip: ipAddress
      })
      .eq('id', fileId);

    if (updateErr) throw updateErr;

    // 4. Write into approval logs for auditing
    const { error: logErr } = await supabase
      .from('approval_logs')
      .insert({
        file_id: fileId,
        client_id: session.client_id,
        action: 'approved',
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (logErr) {
      console.warn('Failed to insert approval audit log:', logErr);
    }

    // 5. Add to freelancer activity logs
    // Find the freelancer_id from the client record
    const { data: client } = await supabase
      .from('clients')
      .select('freelancer_id')
      .eq('id', session.client_id)
      .single();

    if (client) {
      await supabase.from('activity_logs').insert({
        freelancer_id: client.freelancer_id,
        project_id: project.id,
        action: 'file_approved',
        metadata: { file_name: file.file_name }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('File approval API error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
