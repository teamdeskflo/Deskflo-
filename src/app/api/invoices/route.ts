import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ── GET /api/invoices ─────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('invoices')
      .select(`*, clients(id, name, email, company_name), projects(id, name)`)
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/invoices ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const {
      client_id, project_id, description,
      amount, gst_percent = 18,
      due_date,
    } = body;

    if (!client_id || !amount) {
      return NextResponse.json({ error: 'client_id and amount are required' }, { status: 400 });
    }

    const gst_amount   = parseFloat(((amount * gst_percent) / 100).toFixed(2));
    const total_amount = parseFloat((amount + gst_amount).toFixed(2));

    // Auto-generate invoice number: INV-YYYYMM-XXXXX
    const now = new Date();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', freelancerId);

    const invoice_number = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Fetch client email for Razorpay
    const { data: client } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', client_id)
      .eq('freelancer_id', freelancerId)
      .single();

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Create Razorpay payment link
    let payment_link: string | null = null;
    try {
      const rzpLink = await (razorpay.paymentLink as unknown as {
        create: (opts: Record<string, unknown>) => Promise<{ short_url: string }>;
      }).create({
        amount:   Math.round(total_amount * 100), // paise
        currency: 'INR',
        accept_partial: false,
        description:    description || `Invoice ${invoice_number}`,
        customer: {
          name:  client.name,
          email: client.email,
        },
        notify: { email: true },
        reminder_enable: true,
        notes: { invoice_number, freelancer_id: freelancerId },
        callback_url:    `${process.env.NEXT_PUBLIC_APP_URL}/invoices`,
        callback_method: 'get',
      });
      payment_link = rzpLink.short_url;
    } catch (rzpErr) {
      console.warn('Razorpay link creation failed (will save without link):', rzpErr);
    }

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        freelancer_id, client_id, project_id: project_id || null,
        invoice_number, amount, gst_amount, total_amount,
        description, status: 'sent',
        payment_link,
        due_date: due_date || null,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('activity_logs').insert({
      freelancer_id,
      project_id: project_id || null,
      action: 'invoice_created',
      metadata: { invoice_number, amount: total_amount, client_id },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
