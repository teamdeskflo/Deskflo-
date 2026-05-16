'use client';

import {
  Clock, CheckCircle2, IndianRupee, FolderOpen,
  Paperclip, Upload, Receipt, UserPlus, MessageSquare,
  TrendingUp, Eye, AlertCircle, Phone, Mail, X
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';
import { useState } from 'react';
import { INITIAL_MESSAGES } from '@/data/messages';

// ── Data ────────────────────────────────────────────────────
const metrics = [
  {
    label: 'This Month Revenue',
    value: '₹45,000',
    Icon: IndianRupee,
    accentColor: '#D4A017',
    accentBg: '#FDF8EC',
  },
  {
    label: 'Pending Approvals',
    value: '3',
    Icon: Clock,
    accentColor: '#F59E0B',
    accentBg: '#FFFBEB',
  },
  {
    label: 'Unpaid Invoices',
    value: '2',
    Icon: Receipt,
    accentColor: '#EF4444',
    accentBg: '#FEF2F2',
  },
  {
    label: 'Approval Rate',
    value: '87%',
    Icon: TrendingUp,
    accentColor: '#10B981',
    accentBg: '#ECFDF5',
  },
];

const pendingApprovals = [
  { file: 'Homepage_v3.fig',       client: 'Priya Mehta',   status: 'unseen' },
  { file: 'Brand_Kit_Final.pdf',   client: 'Arjun Singh',   status: 'seen'   },
  { file: 'Social_Pack_May.zip',   client: 'Neha Kapoor',   status: 'unseen' },
];

const unpaidInvoices = [
  { id: 'INV-001', client: 'Rahul Sharma', amount: '₹12,000' },
  { id: 'INV-002', client: 'Priya Patel',  amount: '₹6,400'  },
];

const recentActivity = [
  { label: 'Approved in Deskflo',  sub: 'Homepage_v3.fig',      time: '12:33 am', Icon: CheckCircle2, color: '#10B981' },
  { label: 'Paid in Deskflo',      sub: 'INV-001 — ₹12,000',    time: '11:35 am', Icon: IndianRupee,  color: '#10B981' },
  { label: 'Uploaded on Deskflo',  sub: 'Social_Pack_May.zip',  time: '11:45 pm', Icon: Upload,       color: '#6366F1' },
  { label: 'Viewed in Deskflo',    sub: 'SEO_Report_Q2.pdf',    time: '17:29 pm', Icon: Eye,          color: 'var(--text-muted)' },
];

const quickActions = [
  { label: 'Add Client',       Icon: UserPlus,      href: '/dashboard/clients'  },
  { label: 'Upload File',      Icon: Upload,        href: '/dashboard/files'    },
  { label: 'Create Invoice',   Icon: Receipt,       href: '/dashboard/invoices' },
];

// ── Page ─────────────────────────────────────────────────────
export default function DashboardOverviewPage() {
  const user = useUser();
  const firstName = user.name.split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  const [reminderContext, setReminderContext] = useState<{ type: 'approval' | 'invoice', client: string, itemName: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageBody, setMessageBody] = useState('');

  // Open the modal and set initial templates
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
        .replace(/{amount}/g, type === 'invoice' ? '₹12,000' : ''); // mock amount
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
              Sending a reminder to <strong>{reminderContext.client}</strong> regarding <span style={{fontFamily: 'monospace'}}>{reminderContext.itemName}</span>.
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
            <p style={{ fontSize: '22px', fontWeight: 800, color: accentColor, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
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
            background: '#FDF3DC', borderBottom: '1px solid #F5E0A0',
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={14} strokeWidth={2} color="#D4A017" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#92700A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Approvals ({pendingApprovals.length})
            </span>
          </div>
          {pendingApprovals.map((item, i) => (
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
          ))}
        </div>

        {/* Unpaid Invoices */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            background: '#FDF3DC', borderBottom: '1px solid #F5E0A0',
            padding: '11px 18px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <IndianRupee size={14} strokeWidth={2} color="#D4A017" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#92700A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Unpaid Invoices ({unpaidInvoices.length})
            </span>
          </div>
          {unpaidInvoices.map((inv, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 18px',
              borderBottom: i < unpaidInvoices.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#D4A017', margin: '0 0 1px' }}>{inv.id}</p>
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
          ))}
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
        {recentActivity.map(({ label, sub, time, Icon, color }, i) => (
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
        ))}
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
