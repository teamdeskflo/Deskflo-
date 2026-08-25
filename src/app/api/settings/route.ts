import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

// ── GET /api/settings ─────────────────────────────────────────
export async function GET() {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const [profileRes, wlRes, notifRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', freelancerId).single(),
      supabase.from('white_label_settings').select('*').eq('freelancer_id', freelancerId).single(),
      supabase.from('notification_preferences').select('*').eq('freelancer_id', freelancerId).single(),
    ]);

    return NextResponse.json({
      profile:       profileRes.data,
      white_label:   wlRes.data,
      notifications: notifRes.data,
    });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}

// ── PUT /api/settings ─────────────────────────────────────────
// Body: { section: 'profile' | 'white_label' | 'notifications', ...data }
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);
    const body = await request.json();
    const { section, ...data } = body;

    switch (section) {
      case 'profile': {
        const { name, phone, company_name, gst, brand_color } = data;
        const { error } = await supabase
          .from('users')
          .update({ name, phone, company_name, gst, brand_color })
          .eq('id', freelancerId);
        if (error) throw error;
        break;
      }
      case 'white_label': {
        const { logo_url, brand_color, hide_branding, portal_title } = data;
        const { error } = await supabase
          .from('white_label_settings')
          .upsert({ freelancer_id: freelancerId, logo_url, brand_color, hide_branding, portal_title, updated_at: new Date().toISOString() });
        if (error) throw error;
        break;
      }
      case 'notifications': {
        const { error } = await supabase
          .from('notification_preferences')
          .upsert({ freelancer_id: freelancerId, ...data, updated_at: new Date().toISOString() });
        if (error) throw error;
        break;
      }
      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ message: `${section} settings updated` });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
