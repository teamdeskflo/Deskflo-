import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Readable } from 'stream';

// ── GET /api/export — download all user data as ZIP ──────────
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const fid = user.id;

    // Fetch all user data in parallel
    const [profile, clients, projects, files, invoices, tasks, messages, activityLogs] = await Promise.all([
      admin.from('users').select('*').eq('id', fid).single(),
      admin.from('clients').select('*').eq('freelancer_id', fid),
      admin.from('projects').select(`*, clients!inner(freelancer_id)`).eq('clients.freelancer_id', fid),
      admin.from('files').select(`*, projects!inner(client_id, clients!inner(freelancer_id))`).eq('projects.clients.freelancer_id', fid),
      admin.from('invoices').select('*').eq('freelancer_id', fid),
      admin.from('tasks').select('*').eq('freelancer_id', fid),
      admin.from('custom_messages').select('*').eq('freelancer_id', fid),
      admin.from('activity_logs').select('*').eq('freelancer_id', fid).order('created_at', { ascending: false }).limit(1000),
    ]);

    // Build ZIP in memory
    const chunks: Buffer[] = [];
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 6 } });

    const streamDone = new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    const toCSV = (rows: Record<string, unknown>[]): string => {
      if (!rows?.length) return '';
      const headers = Object.keys(rows[0]);
      const lines   = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
      return [headers.join(','), ...lines].join('\n');
    };

    archive.append(JSON.stringify(profile.data, null, 2), { name: 'profile.json' });
    archive.append(toCSV(clients.data || []),       { name: 'clients.csv' });
    archive.append(toCSV((projects.data || []) as Record<string, unknown>[]), { name: 'projects.csv' });
    archive.append(toCSV((files.data || []) as Record<string, unknown>[]),    { name: 'files.csv' });
    archive.append(toCSV(invoices.data || []),      { name: 'invoices.csv' });
    archive.append(toCSV(tasks.data || []),         { name: 'tasks.csv' });
    archive.append(toCSV(messages.data || []),      { name: 'messages.csv' });
    archive.append(toCSV((activityLogs.data || []) as Record<string, unknown>[]), { name: 'activity_logs.csv' });
    archive.append(
      `Deskflo Data Export\nGenerated: ${new Date().toISOString()}\nUser: ${profile.data?.email}\n`,
      { name: 'README.txt' }
    );

    archive.finalize();
    const zipBuffer = await streamDone;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type':        'application/zip',
        'Content-Disposition': `attachment; filename="deskflo-export-${new Date().toISOString().split('T')[0]}.zip"`,
        'Content-Length':      String(zipBuffer.length),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
