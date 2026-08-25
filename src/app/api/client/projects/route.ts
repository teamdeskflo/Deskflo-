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

    // 2. Fetch client details
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', session.client_id)
      .single();

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 });
    }

    // 3. Fetch projects for this client
    const { data: projects, error: projectsErr } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (projectsErr) throw projectsErr;

    // 4. Fetch freelancer details (name, company) & white-label settings
    const { data: freelancer, error: freelancerErr } = await supabase
      .from('users')
      .select('name, company_name')
      .eq('id', client.freelancer_id)
      .single();

    const { data: wLabel, error: wLabelErr } = await supabase
      .from('white_label_settings')
      .select('*')
      .eq('freelancer_id', client.freelancer_id)
      .single();

    const freelancerName = freelancer?.company_name || freelancer?.name || 'Freelancer';
    const logoUrl = wLabel?.logo_url || null;
    const brandColor = wLabel?.brand_color || '#D4A017';

    return NextResponse.json({
      client,
      projects,
      branding: {
        freelancerName,
        logoUrl,
        brandColor,
      }
    });
  } catch (err: unknown) {
    console.error('Client projects API error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
