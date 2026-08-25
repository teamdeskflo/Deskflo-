import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getFreelancerId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Unauthorized');
  return user.id;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const freelancerId = await getFreelancerId(supabase);

    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        projects(id, name, clients(id, name))
      `)
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    return NextResponse.json({ error: msg }, { status: msg === 'Unauthorized' ? 401 : 500 });
  }
}
