'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/lib/auth-context';
import {
  CreditCard, X, AlertTriangle, AlertCircle, Loader2,
  CheckCircle2, Clock, ShieldCheck, RefreshCw, Zap,
  ChevronRight, ArrowRight, Lock, BadgeCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { trialDaysRemaining } from '@/lib/auth-context';

// ── Types ────────────────────────────────────────────────────
type BillingHistoryRow = {
  id: string;
  plan: 'monthly' | 'annual';
  amount: number;
  status: 'paid' | 'failed' | 'refunded';
  created_at: string;
  razorpay_payment_id?: string;
};

// ── Declare Razorpay on window ─────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

// ── Helpers ──────────────────────────────────────────────────
function formatDate(d: Date | string | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatAmount(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Load Razorpay script lazily ───────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Component ────────────────────────────────────────────────
export default function SettingsBillingPage() {
  const user = useUser();
  const supabase = createClient();

  const [billingHistory, setBillingHistory] = useState<BillingHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<false | 'monthly' | 'annual'>(false);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [switchTo, setSwitchTo] = useState<'monthly' | 'annual' | null>(null);

  // Derived state
  const status      = user?.subscription_status ?? 'trial';
  const plan        = user?.billing_plan ?? 'monthly';
  const daysLeft    = trialDaysRemaining(user?.trial_ends_at);
  const isTrialOver = status === 'trial' && daysLeft === 0;
  const priceText   = plan === 'annual' ? '₹2,990/yr' : '₹299/mo';

  // ── Load billing history ──────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setHistoryLoading(false); return; }
    const { data } = await supabase
      .from('billing_history')
      .select('*')
      .eq('freelancer_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setBillingHistory(data ?? []);
    setHistoryLoading(false);
  }, [supabase]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // ── Razorpay Checkout ─────────────────────────────────────
  const openCheckout = async (selectedPlan: 'monthly' | 'annual') => {
    setCheckoutLoading(selectedPlan);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Could not load payment gateway. Please check your connection.');
      setCheckoutLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCheckoutLoading(false); return; }

    // Call backend to create Razorpay Customer + Subscription
    const res = await fetch('/api/billing/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ plan: selectedPlan }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Could not start checkout: ${err.error ?? 'Unknown error'}`);
      setCheckoutLoading(false);
      return;
    }

    const { subscription_id, razorpay_key, customer_id } = await res.json();

    const options = {
      key:             razorpay_key,
      subscription_id: subscription_id,
      customer_id:     customer_id,
      name:            'Deskflo',
      description:     selectedPlan === 'annual' ? 'Annual Plan — ₹2,990/yr' : 'Monthly Plan — ₹299/mo',
      image:           '/deskflo.png',
      prefill: {
        name:    user?.name,
        email:   user?.email,
        contact: '',
      },
      notes: {
        plan: selectedPlan,
        freelancer_id: session.user.id,
      },
      theme: { color: '#111827' },
      handler: () => {
        // Webhook will update DB; refresh page after short delay
        setTimeout(() => window.location.reload(), 2000);
      },
      modal: {
        ondismiss: () => setCheckoutLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setCheckoutLoading(false);
  };

  // ── Switch billing cycle ──────────────────────────────────
  const confirmSwitch = async () => {
    if (!switchTo) return;
    setSwitchLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('users')
        .update({ billing_plan: switchTo })
        .eq('id', session.user.id);
    }
    setSwitchLoading(false);
    setSwitchTo(null);
    window.location.reload();
  };

  // ── Cancel subscription ────────────────────────────────────
  const confirmCancel = async () => {
    setCancelLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Mark as cancelled in DB (webhook from Razorpay will also update this)
      await supabase.from('users')
        .update({ subscription_status: 'cancelled' })
        .eq('id', session.user.id);
    }
    setCancelLoading(false);
    setIsCancelModalOpen(false);
    window.location.reload();
  };

  // ── Status banner config ──────────────────────────────────
  type Banner = { bg: string; border: string; icon: React.ReactNode; text: React.ReactNode; cta?: React.ReactNode };
  const banner: Banner | null = (() => {
    const btnBase: React.CSSProperties = {
      padding: '7px 16px', borderRadius: '8px', border: 'none',
      fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
    };
    if (status === 'trial' && !isTrialOver) return {
      bg: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
      icon: <Clock size={16} color="#D97706" />,
      text: <><strong style={{ color: '#92400E' }}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your free trial.</strong>&nbsp; Your workspace and data are safe.</>,
      cta: <button onClick={() => openCheckout('monthly')} style={{ ...btnBase, background: '#1F2937', color: '#fff' }}>Upgrade Plan</button>,
    };
    if (isTrialOver) return {
      bg: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
      icon: <Lock size={16} color="#DC2626" />,
      text: <><strong style={{ color: '#991B1B' }}>Your free trial has ended.</strong>&nbsp; Workspace is paused — your data is safe.</>,
      cta: <button onClick={() => openCheckout('monthly')} style={{ ...btnBase, background: '#DC2626', color: '#fff' }}>Upgrade Plan</button>,
    };
    if (status === 'active') return {
      bg: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
      icon: <CheckCircle2 size={16} color="#059669" />,
      text: <><strong style={{ color: '#065F46' }}>Subscription Active</strong>&nbsp;·&nbsp;<span style={{ color: '#059669', fontWeight: 700 }}>AutoPay ON</span>&nbsp;·&nbsp;Next charge: {formatDate(user?.next_billing_date)}</>,
      cta: null,
    };
    if (status === 'expired') return {
      bg: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
      icon: <AlertCircle size={16} color="#DC2626" />,
      text: <><strong style={{ color: '#991B1B' }}>Payment failed.</strong>&nbsp; Please update your payment method to continue.</>,
      cta: <button onClick={() => openCheckout(plan)} style={{ ...btnBase, background: '#DC2626', color: '#fff' }}>Update Payment Method</button>,
    };
    if (status === 'cancelled') return {
      bg: 'rgba(107,114,128,0.07)', border: '1px solid rgba(107,114,128,0.2)',
      icon: <AlertTriangle size={16} color="#6B7280" />,
      text: <><strong style={{ color: 'var(--text-primary)' }}>Subscription cancelled.</strong>&nbsp; Access continues until {formatDate(user?.trial_ends_at ?? user?.next_billing_date)}.</>,
      cta: <button onClick={() => openCheckout('monthly')} style={{ ...btnBase, background: '#1F2937', color: '#fff' }}>Reactivate</button>,
    };
    return null;
  })();

  // ── Shared styles ─────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  };
  const sectionHead: React.CSSProperties = {
    fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px',
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', maxWidth: '760px', fontFamily: "'Inter', sans-serif" }}>

      {/* Page Title */}
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Billing
      </h1>

      {/* ── Status Banner ───────────────────────────────── */}
      {banner && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          flexWrap: 'wrap', padding: '12px 16px', borderRadius: '12px',
          background: banner.bg, border: banner.border, marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {banner.icon} {banner.text}
          </div>
          {banner.cta}
        </div>
      )}

      {/* ── Billing Plan ────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '16px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={sectionHead}>Billing Plan</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Monthly */}
            <div style={{
              padding: '20px', borderRadius: '12px',
              border: plan === 'monthly' ? '2px solid var(--text-primary)' : '1px solid var(--border)',
              background: plan === 'monthly' ? 'var(--border-light)' : 'var(--card-bg)',
              position: 'relative',
            }}>
              {plan === 'monthly' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <BadgeCheck size={18} color="var(--text-primary)" />
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>₹299<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span></div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Billed every month</div>
              <button
                onClick={() => status === 'active' && plan === 'monthly' ? undefined : openCheckout('monthly')}
                disabled={checkoutLoading !== false || (status === 'active' && plan === 'monthly')}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: (status === 'active' && plan === 'monthly') ? 'default' : 'pointer',
                  background: (status === 'active' && plan === 'monthly') ? 'var(--border)' : 'var(--text-primary)',
                  color: (status === 'active' && plan === 'monthly') ? 'var(--text-muted)' : 'var(--card-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {checkoutLoading === 'monthly' ? <Loader2 size={14} className="spin" /> : null}
                {status === 'active' && plan === 'monthly' ? 'Current Plan' : 'Upgrade Plan'}
              </button>
            </div>

            {/* Annual */}
            <div style={{
              padding: '20px', borderRadius: '12px',
              border: plan === 'annual' ? '2px solid var(--text-primary)' : '1px solid var(--border)',
              background: plan === 'annual' ? 'var(--border-light)' : 'var(--card-bg)',
              position: 'relative',
            }}>
              {/* Best value badge */}
              <div style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: '#059669', color: '#fff', fontSize: '10px', fontWeight: 800,
                padding: '3px 10px', borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.05em',
              }}>PAY 10 MONTHS, GET 12</div>
              {plan === 'annual' && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <BadgeCheck size={18} color="var(--text-primary)" />
                </div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>Annual</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '2px' }}>₹2,990<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>/yr</span></div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginBottom: '16px' }}>Save ₹598 vs monthly</div>
              <button
                onClick={() => status === 'active' && plan === 'annual' ? undefined : openCheckout('annual')}
                disabled={checkoutLoading !== false || (status === 'active' && plan === 'annual')}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: (status === 'active' && plan === 'annual') ? 'default' : 'pointer',
                  background: (status === 'active' && plan === 'annual') ? 'var(--border)' : '#059669',
                  color: (status === 'active' && plan === 'annual') ? 'var(--text-muted)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {checkoutLoading === 'annual' ? <Loader2 size={14} className="spin" /> : null}
                {status === 'active' && plan === 'annual' ? 'Current Plan' : 'Upgrade Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subscription Details (only when active) ─────── */}
      {status === 'active' && (
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={{ padding: '20px 24px' }}>
            <p style={sectionHead}>Subscription</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Row label="Status">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#059669', fontWeight: 700, fontSize: '13px' }}>
                  <Zap size={13} fill="#059669" /> Active &nbsp;·&nbsp; AutoPay ON
                </span>
              </Row>
              <Row label="Billing cycle">
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize' }}>{plan}</span>
                <button
                  onClick={() => setSwitchTo(plan === 'monthly' ? 'annual' : 'monthly')}
                  style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Switch to {plan === 'monthly' ? 'Annual' : 'Monthly'} <ChevronRight size={12} />
                </button>
              </Row>
              <Row label="Next billing date">
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{formatDate(user?.next_billing_date)}&nbsp;·&nbsp;{priceText}</span>
              </Row>
              <Row label="Payment method">
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {plan === 'monthly' || plan === 'annual' ? <CreditCard size={13} /> : null}
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(user as any)?.payment_method_display ?? 'Autopay enabled'}
                </span>
              </Row>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                style={{ fontSize: '13px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={13} /> Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Method (when method added but not active sub) ─ */}
      {user?.payment_method_added && status !== 'active' && (
        <div style={{ ...cardStyle, marginBottom: '16px' }}>
          <div style={{ padding: '20px 24px' }}>
            <p style={sectionHead}>Payment Method</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                <CreditCard size={15} />
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <span style={{ fontWeight: 600 }}>{(user as any)?.payment_method_display ?? 'Autopay configured'}</span>
              </div>
              <button
                onClick={() => openCheckout(plan)}
                style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', padding: '5px 12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Billing History ──────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '32px' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <p style={sectionHead}>Billing History</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--border-light)' }}>
                {['Date', 'Plan', 'Amount', 'Status', 'Receipt'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Loader2 size={18} className="spin" style={{ margin: '0 auto 6px', display: 'block' }} /> Loading...
                </td></tr>
              ) : billingHistory.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <AlertCircle size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>No payment history yet</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Receipts will appear here after your first payment.</div>
                </td></tr>
              ) : billingHistory.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {formatDate(row.created_at)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', textTransform: 'capitalize', fontWeight: 600 }}>
                    {row.plan}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    {formatAmount(row.amount)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '100px', fontWeight: 700,
                      background: row.status === 'paid' ? 'rgba(16,185,129,0.1)' : row.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'var(--border-light)',
                      color: row.status === 'paid' ? '#059669' : row.status === 'failed' ? '#DC2626' : 'var(--text-muted)',
                    }}>
                      {row.status === 'paid' ? <CheckCircle2 size={11} /> : row.status === 'failed' ? <AlertCircle size={11} /> : null}
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {row.razorpay_payment_id ? (
                      <a
                        href={`https://dashboard.razorpay.com/app/payments/${row.razorpay_payment_id}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        View <ArrowRight size={11} />
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Security note ────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '12px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.12)', marginBottom: '32px' }}>
        <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Payments are processed securely by Razorpay (PCI-DSS Level 1). Deskflo never stores your card number or UPI credentials. AutoPay mandates can be cancelled at any time from this page.
        </p>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════ */}

      {/* Cancel Subscription */}
      {isCancelModalOpen && (
        <Modal onClose={() => setIsCancelModalOpen(false)}>
          <div style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={22} color="#DC2626" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>Cancel Subscription?</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your workspace access will continue until the end of the current billing period. After that, the workspace will be paused. <strong>Your data will not be deleted.</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setIsCancelModalOpen(false)} style={secondaryBtn}>Keep Plan</button>
              <button onClick={confirmCancel} disabled={cancelLoading} style={{ ...primaryBtn, background: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {cancelLoading && <Loader2 size={14} className="spin" />} Yes, Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Switch Billing Cycle */}
      {switchTo && (
        <Modal onClose={() => setSwitchTo(null)}>
          <div style={{ padding: '28px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Switch to {switchTo === 'annual' ? 'Annual' : 'Monthly'} Plan
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {switchTo === 'annual'
                ? <>Switch to <strong>₹2,990/year</strong> — save ₹598 vs monthly. Your next charge will be the annual rate.</>
                : <>Switch to <strong>₹299/month</strong>. You will lose your annual discount from the next billing cycle.</>}
            </p>
            {switchTo === 'annual' && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '10px', marginBottom: '20px', color: '#065F46', fontSize: '13px', fontWeight: 600 }}>
                You save ₹598 / year
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={() => setSwitchTo(null)} style={secondaryBtn}>Cancel</button>
              <button onClick={confirmSwitch} disabled={switchLoading} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {switchLoading && <Loader2 size={14} className="spin" />} Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, minWidth: '140px' }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)', width: '100%', maxWidth: '420px', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '9px 20px', borderRadius: '8px', border: 'none',
  background: '#1F2937', color: 'white', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
};
const secondaryBtn: React.CSSProperties = {
  padding: '9px 20px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text-secondary)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
};
