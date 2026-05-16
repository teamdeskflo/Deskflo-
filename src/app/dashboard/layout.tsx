import type { Metadata } from 'next';
import '../globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { UserProvider } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Deskflo — Dashboard',
  description: 'Client portal at chai prices.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Get authenticated Supabase user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  // Fetch the freelancer profile from our users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Map DB profile → User type for context
  const user: User = {
    name:                profile?.name  ?? authUser.user_metadata?.name ?? authUser.email!.split('@')[0],
    email:               profile?.email ?? authUser.email!,
    company_name:        profile?.company_name   ?? undefined,
    logo_url:            profile?.logo_url        ?? undefined,
    brand_color:         profile?.brand_color     ?? '#D4A017',
    subscription_status: (profile?.subscription_status as User['subscription_status']) ?? 'trial',
    trial_starts_at:     profile?.trial_starts_at ? new Date(profile.trial_starts_at) : new Date(),
    trial_ends_at:       profile?.trial_ends_at   ? new Date(profile.trial_ends_at)   : new Date(Date.now() + 14 * 86400000),
    next_billing_date:   profile?.next_billing_date ? new Date(profile.next_billing_date) : undefined,
    billing_plan:        (profile?.billing_plan as User['billing_plan']) ?? 'monthly',
  };

  return (
    <UserProvider user={user}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--content-bg)' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease' }}
          className="desktop-margin"
        >
          <TopNav />
          <main style={{ flex: 1, padding: '28px' }}>
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}

