import type { Metadata } from 'next';
import '../globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { UserProvider } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User } from '@/lib/auth-context';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Deskflo — Dashboard',
  description: 'Client portal at chai prices.',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient();

    // Get authenticated Supabase user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) redirect('/login');

    // Fetch the freelancer profile from our users table
    const { data: profile, error: profileErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileErr);
    }

    // Map DB profile → User type for context
    const user: User = {
      name:                profile?.name  ?? authUser.user_metadata?.name ?? (authUser.email ? authUser.email.split('@')[0] : 'User'),
      email:               profile?.email ?? authUser.email!,
      company_name:        profile?.company_name   ?? undefined,
      logo_url:            profile?.logo_url        ?? undefined,
      brand_color:         profile?.brand_color     ?? '#D4A017',
      subscription_status: (profile?.subscription_status as User['subscription_status']) ?? 'trial',
      trial_starts_at:     profile?.trial_starts_at ? new Date(profile.trial_starts_at) : new Date(),
      trial_ends_at:       profile?.trial_ends_at   ? new Date(profile.trial_ends_at)   : new Date(Date.now() + 7 * 86400000),
      next_billing_date:   profile?.next_billing_date ? new Date(profile.next_billing_date) : undefined,
      billing_plan:        (profile?.billing_plan as User['billing_plan']) ?? 'monthly',
      payment_method_added: profile?.payment_method_added ?? false,
      payment_method_display: profile?.payment_method_display ?? undefined,
    };

    const isTrial = user.subscription_status === 'trial';
    const isExpiredTrial = isTrial && user.trial_ends_at && new Date() > user.trial_ends_at;
    // Locked = expired trial with no autopay, OR subscription status is 'expired'
    const isLocked = (isExpiredTrial && !user.payment_method_added) || user.subscription_status === 'expired';
    const lockReason: 'trial' | 'payment' = user.subscription_status === 'expired' ? 'payment' : 'trial';

    // Always allow billing page through even when locked
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') ?? '';
    const isBillingPage = pathname.includes('/settings/billing');

    return (
      <UserProvider user={user}>
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--content-bg)' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease' }}
            className="desktop-margin"
          >
            <TopNav />
            <main style={{ flex: 1, padding: '28px' }}>
              {(isLocked && !isBillingPage) ? (
                <div style={{ textAlign: 'center', marginTop: '12vh', padding: '0 24px' }}>
                  <div style={{ width: '64px', height: '64px', background: lockReason === 'trial' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: lockReason === 'trial' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(245,158,11,0.25)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={lockReason === 'trial' ? '#DC2626' : '#D97706'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    {lockReason === 'trial' ? 'Your free trial has ended.' : 'Subscription payment failed.'}
                  </h1>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', maxWidth: '360px', margin: '0 auto 8px' }}>
                    {lockReason === 'trial'
                      ? 'Upgrade your plan to continue using Deskflo. Your data is safe and waiting for you.'
                      : 'Your workspace is paused due to a failed payment. Please update your billing details.'}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '28px' }}>Your workspace data is safe and will not be deleted.</p>
                  <a href="/dashboard/settings/billing" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 28px', background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>Upgrade Plan →</a>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </UserProvider>
    );
  } catch (err: any) {
    return (
      <div style={{ padding: '40px', color: 'red' }}>
        <h2>Layout Error</h2>
        <pre>{err?.message || String(err)}</pre>
        <pre>{err?.stack}</pre>
      </div>
    );
  }
}

