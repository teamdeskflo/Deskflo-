import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { freelancerEmail, loginToken } = await request.json();

    if (!freelancerEmail || !loginToken) {
      return NextResponse.json({ error: 'Freelancer email and access token are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch client by access token
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('login_token', loginToken)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
    }

    // 2. Fetch associated freelancer and verify email matches
    const { data: freelancer, error: freelancerErr } = await supabase
      .from('users')
      .select('email')
      .eq('id', client.freelancer_id)
      .single();

    if (freelancerErr || !freelancer || freelancer.email.toLowerCase() !== freelancerEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Freelancer email does not match this access token' }, { status: 401 });
    }

    // 3. Generate secure session token and insert into client_sessions
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: insertErr } = await supabase
      .from('client_sessions')
      .insert({
        client_id: client.id,
        token: sessionToken,
        expires_at: expiresAt,
      });

    if (insertErr) {
      console.error('Failed to save client session:', insertErr);
      return NextResponse.json({ error: 'Failed to establish session' }, { status: 500 });
    }

    return NextResponse.json({ sessionToken });
  } catch (err: unknown) {
    console.error('Client login API error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
