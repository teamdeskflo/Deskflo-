import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/messages ─────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('custom_messages')
      .select('*')
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) throw error;

    // Merge with built-in templates
    const defaults = getDefaultMessages();
    return NextResponse.json({ custom: data, defaults });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── POST /api/messages ────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const { category, title, content } = await request.json();

    if (!category || !title || !content) {
      return NextResponse.json({ error: 'category, title, and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('custom_messages')
      .insert({ freelancer_id: freelancerId, category, title, content })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

function getDefaultMessages() {
  return [
    {
      category: 'project_start',
      title: 'Project Kickoff',
      content: 'Hi {client_name}! 🎉 Your project "{project_name}" has officially started. I\'ll keep you updated on progress. Feel free to reach out anytime!',
    },
    {
      category: 'file_approval',
      title: 'File Ready for Approval',
      content: 'Hi {client_name}, your file "{file_name}" is ready for review. Please click the link to approve: {approval_link}',
    },
    {
      category: 'invoice_sent',
      title: 'Invoice Sent',
      content: 'Hi {client_name}, Invoice #{invoice_number} for ₹{amount} has been sent. Please pay via: {payment_link}. Due date: {due_date}.',
    },
    {
      category: 'payment_reminder',
      title: 'Payment Reminder',
      content: 'Hi {client_name}, just a friendly reminder that Invoice #{invoice_number} (₹{amount}) is due on {due_date}. {payment_link}',
    },
    {
      category: 'project_complete',
      title: 'Project Completed',
      content: 'Hi {client_name}! 🚀 Your project "{project_name}" is complete. It was a pleasure working with you! Please leave a review if you\'re happy with the work.',
    },
  ];
}
