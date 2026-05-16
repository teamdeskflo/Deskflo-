import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// ── GET /api/approve/[token] — client visits approval link ────
// This is a public route (no auth required) — clients click this link
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const admin = createAdminClient();

    // Resolve slug → file
    const { data: link, error: linkError } = await admin
      .from('shared_links')
      .select(`
        id, file_id, type, clicks,
        files(id, file_name, file_url, file_type, is_approved, project_id,
          projects(id, name, clients(id, name, company_name,
            users:freelancer_id(name, company_name, brand_color, logo_url)))
        )
      `)
      .eq('slug', token)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 });
    }

    // Increment click counter
    await admin
      .from('shared_links')
      .update({ clicks: link.clicks + 1, last_clicked_at: new Date().toISOString() })
      .eq('id', link.id);

    return NextResponse.json({ link, file: link.files });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── POST /api/approve/[token] — client submits approval action ─
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const admin = createAdminClient();

    const body = await request.json();
    const action: 'viewed' | 'approved' | 'rejected' = body.action || 'approved';

    // Get IP and user agent from request headers
    const ip         = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
    const userAgent  = request.headers.get('user-agent') ?? '';

    // Resolve link → file
    const { data: link, error } = await admin
      .from('shared_links')
      .select('id, file_id, type, files(id, project_id, projects(client_id))')
      .eq('slug', token)
      .single();

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const fileId   = link.file_id;
    const clientId = (link.files as { project_id: string; projects: { client_id: string } }).projects?.client_id;

    // Log the approval action
    await admin.from('approval_logs').insert({
      file_id:    fileId,
      client_id:  clientId || null,
      action,
      ip_address: ip,
      user_agent: userAgent,
    });

    // If approved → update file record
    if (action === 'approved') {
      await admin.from('files').update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_ip: ip,
      }).eq('id', fileId);
    }

    // If first view → update viewed_at
    if (action === 'viewed') {
      await admin.from('files').update({
        viewed_at: new Date().toISOString(),
        viewed_ip: ip,
      }).eq('id', fileId).is('viewed_at', null);
    }

    return NextResponse.json({ message: `File ${action} successfully`, action });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
