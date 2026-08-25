import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

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
    return NextResponse.json(
      { error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// ── POST /api/invoices ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const {
      client_id,
      project_id,
      description,
      line_items,
      amount,
      gst_percent = 18,
      due_date,
      payment_method,
      payment_details,
      notes,
    } = body;

    if (!client_id || !amount) {
      return NextResponse.json(
        { error: 'client_id and amount are required' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    const gst_amount = parseFloat(((amount * gst_percent) / 100).toFixed(2));
    const total_amount = parseFloat((amount + gst_amount).toFixed(2));

    // Auto-generate invoice number: INV-YYYYMM-XXXX
    const now = new Date();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('freelancer_id', freelancerId);

    const invoice_number = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Verify client belongs to this freelancer
    const { data: client } = await supabase
      .from('clients')
      .select('name, email')
      .eq('id', client_id)
      .eq('freelancer_id', freelancerId)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const cleanDueDate = (due_date && typeof due_date === 'string' && due_date.trim() !== '') ? due_date : null;
    const cleanProjectId = (project_id && typeof project_id === 'string' && project_id.trim() !== '') ? project_id : null;
    const cleanLineItems = Array.isArray(line_items) ? line_items : [];
    const cleanPaymentMethod = (payment_method && typeof payment_method === 'string') ? payment_method.trim() : null;
    const cleanPaymentDetails = (payment_details && typeof payment_details === 'string') ? payment_details.trim() : null;
    const cleanNotes = (notes && typeof notes === 'string') ? notes.trim() : null;

    const insertPayload = {
      freelancer_id: freelancerId,
      client_id,
      project_id: cleanProjectId,
      invoice_number,
      amount,
      gst_amount,
      gst_percent,
      total_amount,
      description: description || null,
      line_items: cleanLineItems as any,
      payment_method: cleanPaymentMethod,
      payment_details: cleanPaymentDetails,
      notes: cleanNotes,
      status: 'sent',
      due_date: cleanDueDate,
    };

    const { data: invoiceData, error: insertError } = await supabase
      .from('invoices')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(invoiceData, { status: 201 });

    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      project_id: cleanProjectId,
      action: 'invoice_created',
      metadata: {
        invoice_number,
        amount: total_amount,
        client_id,
        client_name: client.name,
      },
    });

    return NextResponse.json(invoiceData, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json(
      { error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// ── PATCH /api/invoices ── update status (paid, overdue etc.) ─
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();

    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const allowedStatuses = ['sent', 'paid', 'overdue', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${allowedStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)
      .eq('freelancer_id', freelancerId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    await supabase.from('activity_logs').insert({
      freelancer_id: freelancerId,
      project_id: data.project_id || null,
      action: 'invoice_status_updated',
      metadata: { invoice_number: data.invoice_number, status },
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json(
      { error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// ── DELETE /api/invoices ──────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice id is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('freelancer_id', freelancerId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json(
      { error: msg },
      { status: msg === 'Unauthorized' ? 401 : 500 }
    );
  }
}