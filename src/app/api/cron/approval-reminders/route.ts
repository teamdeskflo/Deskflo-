import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// ── GET /api/cron/approval-reminders ─────────────────────────
// Triggered daily by Vercel Cron — sends email reminders for unapproved files older than 48h

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Find all unapproved files older than 48 hours that haven't been viewed recently
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: pendingFiles, error } = await supabase
      .from('files')
      .select(`
        id, file_name, created_at,
        shared_links(slug, type),
        projects(
          id, name,
          clients(
            id, name, email,
            users:freelancer_id(name, email)
          )
        )
      `)
      .eq('is_approved', false)
      .lte('created_at', cutoff)
      .limit(50);

    if (error) throw error;

    let sent = 0;
    const errors: string[] = [];

    for (const file of pendingFiles || []) {
      try {
        const project = file.projects as {
          name: string;
          clients: {
            name: string;
            email: string;
            users: { name: string; email: string };
          };
        };

        const approvalLink = (file.shared_links as { slug: string; type: string }[])
          .find(l => l.type === 'approval');

        if (!approvalLink || !project?.clients?.email) continue;

        const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/approve/${approvalLink.slug}`;
        const freelancer  = project.clients.users;

        await resend.emails.send({
          from:    `${freelancer.name} via Deskflo <noreply@deskflo.in>`,
          to:      project.clients.email,
          subject: `Reminder: "${file.file_name}" needs your approval`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 32px;">
              <h2 style="color: #111827;">Hi ${project.clients.name},</h2>
              <p>Just a friendly reminder that <strong>${file.file_name}</strong> from project 
                 <strong>${project.name}</strong> is still waiting for your approval.</p>
              <a href="${approvalUrl}" 
                 style="display: inline-block; padding: 12px 24px; background: #D4A017; 
                        color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Review & Approve File
              </a>
              <p style="color: #6B7280; font-size: 13px;">
                Sent by ${freelancer.name} using <a href="https://deskflo.in">Deskflo</a>
              </p>
            </div>
          `,
        });
        sent++;
      } catch (emailErr) {
        errors.push(`File ${file.id}: ${(emailErr as Error).message}`);
      }
    }

    return NextResponse.json({ sent, errors, total: (pendingFiles || []).length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
