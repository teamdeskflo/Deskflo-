import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// ── POST /api/send-reminder ───────────────────────────────────
// Body: { type: 'approval' | 'invoice', clientEmail: string, clientName: string, subject: string, body: string }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Load freelancer profile for sender name
    const { data: profile } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const body = await request.json();
    const { clientEmail, clientName, subject, messageBody, type } = body;

    if (!clientEmail || !messageBody) {
      return NextResponse.json({ error: 'clientEmail and messageBody are required' }, { status: 400 });
    }

    const freelancerName = profile?.name || 'Your Freelancer';

    // Convert plain text message to simple HTML
    const htmlBody = `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 32px; color: #111827;">
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 4px;">
            ${type === 'approval' ? '📎 Approval Reminder' : '💰 Invoice Reminder'}
          </h2>
          <p style="font-size: 13px; color: #6B7280; margin: 0;">Sent via Deskflo</p>
        </div>
        <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.7; color: #1F2937; background: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB;">
${messageBody}
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF;">
          Sent by <strong>${freelancerName}</strong> using <a href="https://deskflo.in" style="color: #D4A017; text-decoration: none;">Deskflo</a>
        </div>
      </div>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${freelancerName} via Deskflo <noreply@deskflo.in>`,
      to: clientEmail,
      subject: subject || `Reminder from ${freelancerName}`,
      html: htmlBody,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }

    // Log the reminder activity
    await supabase.from('activity_logs').insert({
      freelancer_id: user.id,
      action: 'reminder_sent',
      metadata: { type, clientEmail, clientName, emailId: emailData?.id },
    });

    return NextResponse.json({ success: true, emailId: emailData?.id });
  } catch (err: unknown) {
    console.error('Send reminder error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
