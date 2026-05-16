import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// ── GET /api/cron/invoice-reminders ──────────────────────────
// Triggered daily — sends reminders for invoices overdue or due within 3 days

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now      = new Date();
    const in3Days  = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Invoices that are overdue OR due within 3 days and still 'sent'
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        id, invoice_number, total_amount, due_date, payment_link, status,
        clients(name, email),
        users:freelancer_id(name, email)
      `)
      .in('status', ['sent', 'overdue'])
      .lte('due_date', in3Days.toISOString().split('T')[0])
      .limit(50);

    if (error) throw error;

    // Mark overdue invoices
    const overdueIds = (invoices || [])
      .filter(i => i.due_date && new Date(i.due_date) < now)
      .map(i => i.id);

    if (overdueIds.length > 0) {
      await supabase
        .from('invoices')
        .update({ status: 'overdue' })
        .in('id', overdueIds);
    }

    let sent = 0;
    const errors: string[] = [];

    for (const inv of invoices || []) {
      try {
        const client     = inv.clients as { name: string; email: string };
        const freelancer = (inv as unknown as { users: { name: string; email: string } }).users;
        const isOverdue  = inv.due_date && new Date(inv.due_date) < now;

        if (!client?.email) continue;

        await resend.emails.send({
          from:    `${freelancer.name} via Deskflo <noreply@deskflo.in>`,
          to:      client.email,
          subject: isOverdue
            ? `⚠️ Overdue Invoice #${inv.invoice_number} — ₹${inv.total_amount}`
            : `Reminder: Invoice #${inv.invoice_number} due soon`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 32px;">
              <h2 style="color: ${isOverdue ? '#EF4444' : '#111827'};">
                ${isOverdue ? '⚠️ Overdue Payment' : 'Invoice Payment Reminder'}
              </h2>
              <p>Hi ${client.name},</p>
              <p>Invoice <strong>#${inv.invoice_number}</strong> for 
                 <strong>₹${inv.total_amount}</strong> ${isOverdue ? 'was due on' : 'is due on'}
                 <strong>${inv.due_date}</strong> and is still unpaid.</p>
              ${inv.payment_link ? `
              <a href="${inv.payment_link}"
                 style="display: inline-block; padding: 12px 24px; background: #D4A017;
                        color: white; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Pay Now — ₹${inv.total_amount}
              </a>` : ''}
              <p style="color: #6B7280; font-size: 13px;">
                Sent by ${freelancer.name} using <a href="https://deskflo.in">Deskflo</a>
              </p>
            </div>
          `,
        });
        sent++;
      } catch (emailErr) {
        errors.push(`Invoice ${inv.id}: ${(emailErr as Error).message}`);
      }
    }

    return NextResponse.json({ sent, errors, overdueMarked: overdueIds.length });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
