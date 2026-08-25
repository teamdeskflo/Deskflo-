import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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

    // 2. Fetch invoices for this client
    const { data: invoices, error: invoicesErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', session.client_id)
      .order('created_at', { ascending: false });

    if (invoicesErr) throw invoicesErr;

    return NextResponse.json({ invoices });
  } catch (err: unknown) {
    console.error('Client invoices fetch error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
