import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_DOMAINS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'www.dropbox.com',
  'onedrive.live.com',
  'sharepoint.com',
  '1drv.ms',
  'live.com',
  'figma.com',
  'www.figma.com',
  'notion.so',
  'www.notion.so',
  'notion.site',
  'www.notion.site'
];

function validateHostingUrl(urlStr: string): boolean {
  try {
    let testUrl = urlStr.trim();
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }
    const parsed = new URL(testUrl);
    const hostname = parsed.hostname.toLowerCase();
    
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── PATCH /api/files/[id] — Edit file details ───────────────────
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();
    const { file_name, file_url, file_type } = body;

    // Resolve file and verify project ownership
    const { data: file, error: fileErr } = await supabase
      .from('files')
      .select(`
        *,
        projects!inner(
          id,
          clients!inner(
            freelancer_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (fileErr || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileProjects = file.projects as unknown as { id: string; clients: { freelancer_id: string } };
    if (fileProjects.clients.freelancer_id !== freelancerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Enforce lock/immutability if file is approved
    if (file.is_approved) {
      return NextResponse.json({ error: 'Approved files are locked and cannot be edited' }, { status: 400 });
    }

    // Validate the updated URL if provided
    if (file_url && !validateHostingUrl(file_url)) {
      return NextResponse.json({ error: 'Invalid URL. Only links from Google Drive, Dropbox, OneDrive, Figma, and Notion are accepted.' }, { status: 400 });
    }

    // Update details
    const { data: updatedFile, error: updateErr } = await supabase
      .from('files')
      .update({
        file_name: file_name ?? file.file_name,
        file_url: file_url ?? file.file_url,
        file_type: file_type ?? file.file_type,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, file: updatedFile });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── DELETE /api/files/[id] — Delete file ───────────────────────
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    // Resolve file and verify project ownership
    const { data: file, error: fileErr } = await supabase
      .from('files')
      .select(`
        *,
        projects!inner(
          id,
          clients!inner(
            freelancer_id
          )
        )
      `)
      .eq('id', id)
      .single();

    if (fileErr || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileProjects = file.projects as unknown as { id: string; clients: { freelancer_id: string } };
    if (fileProjects.clients.freelancer_id !== freelancerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Enforce lock/immutability if file is approved
    if (file.is_approved) {
      return NextResponse.json({ error: 'Approved files are locked and cannot be deleted' }, { status: 400 });
    }

    // Perform deletion
    const { error: deleteErr } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    // Log deletion activity
    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      project_id: fileProjects.id,
      action: 'file_deleted',
      metadata: { file_name: file.file_name },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
