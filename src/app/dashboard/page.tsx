'use client';

import {
  Clock, CheckCircle2, IndianRupee, FolderOpen,
  Paperclip, Upload, Receipt, UserPlus, MessageSquare,
  TrendingUp, Eye, AlertCircle, Phone, Mail, X
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { INITIAL_MESSAGES } from '@/data/messages';

// ── Types ──────────────────────────────────────────────────
type Metric = {
  label: string;
  value: string;
  Icon: any;
  accentColor: string;
  accentBg: string;
};

type PendingApproval = {
  fileId: string;
  file: string;
  client: string;
};

type UnpaidInvoice = {
  id: string;
  client: string;
  amount: string;
};

type Activity = {
  label: string;
  sub: string;
  time: string;
  Icon: any;
  color: string;
};

export default function DashboardOverviewPage() {
  const user = useUser();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Freelancer';
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // ── States ────────────────────────────────────────────────
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'This Month Revenue', value: '₹0', Icon: IndianRupee, accentColor: '#D4A017', accentBg: 'var(--border-light)' },
    { label: 'Pending Approvals', value: '0', Icon: Clock, accentColor: '#F59E0B', accentBg: 'var(--border-light)' },
    { label: 'Unpaid Invoices', value: '0', Icon: Receipt, accentColor: '#EF4444', accentBg: 'var(--border-light)' },
    { label: 'Approval Rate', value: '0%', Icon: TrendingUp, accentColor: '#10B981', accentBg: 'var(--border-light)' },
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [reminderContext, setReminderContext] = useState<{ type: 'approval' | 'invoice', client: string, itemName: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageBody, setMessageBody] = useState('');

  // ── Fetch Dashboard Data ──────────────────────────────────
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Fetch analytics
        const analyticsReq = await fetch('/api/analytics');
        const analytics = await analyticsReq.json();

        // Fetch pending files
        const filesReq = await fetch('/api/files');
        const files = await filesReq.json();
        const pendingFiles = Array.isArray(files)
          ? files.filter((f: any) => !f.is_approved).slice(0, 3).map((f: any) => ({
            fileId: f.id,
            file: f.file_name,
            client: f.projects?.clients?.name || 'Client',
          }))
          : [];

        // Fetch unpaid invoices
        const invoicesReq = await fetch('/api/invoices');
        const invoices = await invoicesReq.json();
        const unpaid = Array.isArray(invoices)
          ? invoices.filter((i: any) => i.status !== 'paid').slice(0, 3).map((i: any) => ({
            id: i.invoice_number,
            client: i.clients?.name || 'Client',
            amount: `₹${Number(i.total_amount).toLocaleString('en-IN')}`,
          }))
          : [];

        // Fetch recent activities
        const actReq = await fetch('/api/activities');
        const activities = await actReq.json();
        const recent = Array.isArray(activities)
          ? activities.slice(0, 4).map((a: any) => {
            let label = 'Activity logged';
            let sub = '';
            let Icon = Clock;
            let color = 'var(--text-muted)';

            if (a.action === 'file_uploaded') {
              label = 'Uploaded file';
              sub = a.metadata?.file_name || 'Project File';
              Icon = Upload;
              color = '#6366F1';
            } else if (a.action === 'file_approved') {
              label = 'Approved file';
              sub = a.metadata?.file_name || 'Project File';
              Icon = CheckCircle2;
              color = '#10B981';
            } else if (a.action === 'invoice_created') {
              label = 'Created invoice';
              sub = a.metadata?.invoice_number || 'INV';
              Icon = Receipt;
              color = '#F59E0B';
            } else if (a.action === 'invoice_paid') {
              label = 'Paid invoice';
              sub = `${a.metadata?.invoice_number} — ₹${a.metadata?.amount || '0'}`;
              Icon = IndianRupee;
              color = '#10B981';
            }

            return {
              label,
              sub,
              time: new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              Icon,
              color,
            };
          })
          : [];

        // Update metrics
        if (analytics && !analytics.error) {
          const revVal = `₹${Number(analytics.revenue?.total || 0).toLocaleString('en-IN')}`;
          const pendingVal = String(analytics.files?.total - analytics.files?.approved || 0);
          const unpaidVal = String(analytics.invoices?.sent + analytics.invoices?.overdue || 0);
          const appRateVal = `${analytics.files?.approvalRate || 0}%`;

          setMetrics([
            { label: 'Total Revenue', value: revVal, Icon: IndianRupee, accentColor: '#D4A017', accentBg: '#FDF8EC' },
            { label: 'Pending Approvals', value: pendingVal, Icon: Clock, accentColor: '#F59E0B', accentBg: '#FFFBEB' },
            { label: 'Unpaid Invoices', value: unpaidVal, Icon: Receipt, accentColor: '#EF4444', accentBg: '#FEF2F2' },
            { label: 'Approval Rate', value: appRateVal, Icon: TrendingUp, accentColor: '#10B981', accentBg: '#ECFDF5' },
          ]);
        }

        setPendingApprovals(pendingFiles);
        setUnpaidInvoices(unpaid);
        setRecentActivity(recent);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // ── Open reminder modal ───────────────────────────────────
  const handleOpenReminder = (type: 'approval' | 'invoice', client: string, itemName: string) => {
    setReminderContext({ type, client, itemName });
    const category = type === 'approval' ? 'Approval Requests & Reminders' : 'Invoices & Payments';
    const templates = INITIAL_MESSAGES.filter(m => m.category === category);

    if (templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
      let parsedMsg = templates[0].content
        .replace(/{client_name}/g, client.split(' ')[0])
        .replace(/{freelancer_name}/g, firstName)
        .replace(/{file_name}/g, itemName)
        .replace(/{invoice_number}/g, itemName)
        .replace(/{amount}/g, type === 'invoice' ? '₹12,000' : '');
      setMessageBody(parsedMsg);
    } else {
      setSelectedTemplateId('');
      setMessageBody(`Hi ${client.split(' ')[0]}, just a quick reminder about ${itemName}.`);
    }
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = INITIAL_MESSAGES.find(m => m.id === id);
    if (tmpl && reminderContext) {
      let parsedMsg = tmpl.content
        .replace(/{client_name}/g, reminderContext.client.split(' ')[0])
        .replace(/{freelancer_name}/g, firstName)
        .replace(/{file_name}/g, reminderContext.itemName)
        .replace(/{invoice_number}/g, reminderContext.itemName)
        .replace(/{amount}/g, reminderContext.type === 'invoice' ? '₹12,000' : '');
      setMessageBody(parsedMsg);
    }
  };

  const handleSend = (method: 'whatsapp' | 'email') => {
    if (!reminderContext) return;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(messageBody)}`, '_blank');
    } else {
      const subject = encodeURIComponent(`Reminder regarding ${reminderContext.itemName}`);
      window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(messageBody)}`;
    }
    setReminderContext(null);
  };

  const quickActions = [
    { label: 'Add Client', Icon: UserPlus, href: '/dashboard/clients' },
    { label: 'Upload File', Icon: Upload, href: '/dashboard/files' },
    { label: 'Create Invoice', Icon: Receipt, href: '/dashboard/invoices' },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Reminder Modal */}
      {reminderContext && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
        }} onClick={() => setReminderContext(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
              padding: '24px', width: '100%', maxWidth: '500px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Send Reminder
              </h2>
              <button onClick={() => setReminderContext(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Sending a reminder to <strong>{reminderContext.client}</strong> regarding <span style={{ fontFamily: 'monospace' }}>{reminderContext.itemName}</span>.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Message Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => handleTemplateChange(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', fontSize: '13px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  background: 'var(--card-bg)', outline: 'none'
                }}
              >
                {INITIAL_MESSAGES.filter(m => m.category === (reminderContext.type === 'approval' ? 'Approval Requests & Reminders' : 'Invoices & Payments')).map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Message Body (Editable)
              </label>
              <textarea
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                rows={7}
                style={{
                  width: '100%', padding: '12px', fontSize: '13px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  background: 'var(--card-bg)', outline: 'none', resize: 'none',
                  fontFamily: 'inherit', lineHeight: 1.5, color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button onClick={() => handleSend('email')} style={{
                padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
              }}><Mail size={16} /> Send via Email</button>
              <button onClick={() => handleSend('whatsapp')} style={{
                padding: '10px', borderRadius: 'var(--radius-md)', border: 'none',
                background: '#25D366', color: 'white', fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
              }}><Phone size={16} /> Send via WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome header */}
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', letterSpacing: '-0.4px' }}>
          Welcome back, {firstName}!
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{today}</p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {metrics.map(({ label, value, Icon, accentColor, accentBg }) => (
          <div key={label} style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
              background: accentBg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '12px',
            }}>
              <Icon size={17} strokeWidth={2} color={accentColor} />
            </div>
            <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {value}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Middle row: Pending Approvals + Unpaid Invoices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Pending Approvals */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            background: 'var(--border-light)', borderBottom: '1px solid var(--border)',
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={14} strokeWidth={2} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Approvals ({pendingApprovals.length})
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
          ) : pendingApprovals.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-secondary)' }}>All clear!</p>
              <p style={{ fontSize: '11.5px', margin: 0 }}>No pending file approvals.</p>
            </div>
          ) : (
            pendingApprovals.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 18px',
                borderBottom: i < pendingApprovals.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--content-bg)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Paperclip size={13} strokeWidth={1.8} color="var(--text-muted)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 1px' }}>{item.file}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{item.client}</p>
                  </div>
                </div>
                <button onClick={() => handleOpenReminder('approval', item.client, item.file)} style={{
                  fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '5px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  Send Reminder →
                </button>
              </div>
            ))
          )}
        </div>

        {/* Unpaid Invoices */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            background: 'var(--border-light)', borderBottom: '1px solid var(--border)',
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <IndianRupee size={14} strokeWidth={2} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unpaid Invoices ({unpaidInvoices.length})
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
          ) : unpaidInvoices.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-secondary)' }}>All paid up!</p>
              <p style={{ fontSize: '11.5px', margin: 0 }}>No outstanding invoices.</p>
            </div>
          ) : (
            unpaidInvoices.map((inv, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px',
                borderBottom: i < unpaidInvoices.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1px' }}>{inv.id}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{inv.client} · {inv.amount}</p>
                </div>
                <button onClick={() => handleOpenReminder('invoice', inv.client, inv.id)} style={{
                  fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '5px 10px', cursor: 'pointer',
                }}>
                  Send Reminder →
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)', marginBottom: '14px',
      }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderOpen size={14} strokeWidth={2} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Recent Activity
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
        ) : recentActivity.length === 0 ? (
          <div style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No recent activity logs yet. Your uploads, approvals, and invoice actions will appear here!
          </div>
        ) : (
          recentActivity.map(({ label, sub, time, Icon, color }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} strokeWidth={2} color={color} />
                </div>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label} </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sub}</span>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{time}</span>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <MessageSquare size={14} strokeWidth={2} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Actions
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {quickActions.map(({ label, Icon, href }) => (
            <a key={label} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
              borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '13.5px',
              textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
            }}>
              <Icon size={14} strokeWidth={2.2} />
              {label}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
