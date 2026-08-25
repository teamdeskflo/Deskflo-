'use client';

import { useState, useEffect } from 'react';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  FolderOpen, BarChart2, ChevronDown, Check, Link as LinkIcon,
  Clock, CheckCircle2, AlertCircle, FileText, Send
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type InvoiceStatus = 'sent' | 'paid' | 'overdue';

type Invoice = {
  id: string; // Internal UUID
  invoiceNumber: string; // e.g., INV-202305-0001
  clientName: string;
  projectName: string;
  status: InvoiceStatus;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  paymentLink?: string;
  description?: string;
};

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; icon: any; color: string; bg: string }> = {
  sent:    { label: 'Sent',    icon: Clock,        color: '#3B82F6', bg: '#EFF6FF' },
  paid:    { label: 'Paid',    icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
  overdue: { label: 'Overdue', icon: AlertCircle,  color: '#EF4444', bg: '#FEF2F2' },
};

const formatCurrency = (val: number) => {
  return `₹${val.toLocaleString('en-IN')}`;
};

// ── Copy Link Button Component ───────────────────────────────
function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 10px', borderRadius: 'var(--radius-sm)',
        background: 'var(--content-bg)', border: '1px solid var(--border)',
        fontSize: '11.5px', fontWeight: 600, color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => !copied && (e.currentTarget.style.borderColor = 'var(--text-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => !copied && (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {copied ? <Check size={12} strokeWidth={2.5} /> : <LinkIcon size={12} strokeWidth={2} />}
      {copied ? 'Link Copied!' : 'Copy Pay Link'}
    </button>
  );
}

// ── Add Modal ───────────────────────────────
function InvoiceModal({ onClose, onSave }: { onClose: () => void; onSave: (inv: Record<string, any>) => void }) {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    amount: '',
    gst_percent: 18,
    due_date: '',
    description: '',
  });

  // Load clients and projects
  useEffect(() => {
    async function loadData() {
      try {
        const clientRes = await fetch('/api/clients');
        const clientData = await clientRes.json();
        if (Array.isArray(clientData)) {
          setClients(clientData.map(c => ({ id: c.id, name: c.name })));
          if (clientData.length > 0) {
            setFormData(prev => ({ ...prev, client_id: clientData[0].id }));
          }
        }

        const projectRes = await fetch('/api/projects');
        const projectData = await projectRes.json();
        if (Array.isArray(projectData)) {
          setProjects(projectData.map(p => ({ id: p.id, name: p.name })));
          if (projectData.length > 0) {
            setFormData(prev => ({ ...prev, project_id: projectData[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading client/project data in invoice modal:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          padding: '28px', width: '100%', maxWidth: '460px',
          boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          Create New Invoice
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Client Selector Dropdown */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Select Client
            </label>
            <select
              value={formData.client_id}
              onChange={e => setFormData({ ...formData, client_id: e.target.value })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                cursor: 'pointer'
              }}
            >
              {clients.length === 0 ? (
                <option value="">No clients found (Add client first)</option>
              ) : (
                clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </select>
          </div>

          {/* Project Selector Dropdown */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Select Project (Optional)
            </label>
            <select
              value={formData.project_id}
              onChange={e => setFormData({ ...formData, project_id: e.target.value })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                cursor: 'pointer'
              }}
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Base Amount */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Base Amount (excluding GST)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="25000"
                style={{
                  width: '100%', padding: '9px 12px 9px 24px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                }}
              />
            </div>
          </div>

          {/* GST Percent */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              GST Rate
            </label>
            <select
              value={formData.gst_percent}
              onChange={e => setFormData({ ...formData, gst_percent: Number(e.target.value) })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                cursor: 'pointer'
              }}
            >
              <option value={18}>18% (Standard Services)</option>
              <option value={0}>0% (Exempt / SEZ Export)</option>
              <option value={5}>5% (Basic)</option>
              <option value={12}>12% (Contractual)</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Description / Notes
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope description for the invoice..."
              rows={3}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                resize: 'none', fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.client_id || !formData.amount) return alert('Client and amount are required');
              onSave(formData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >Generate Invoice</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function InvoicesPage() {
  const user = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'paid' | 'overdue'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [modal, setModal] = useState<boolean>(false);

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // ── Fetch Invoices ────────────────────────────────────────
  async function loadInvoices() {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((i: any) => ({
          id: i.id,
          invoiceNumber: i.invoice_number,
          clientName: i.clients?.name || 'Client',
          projectName: i.projects?.name || 'General Project',
          status: i.status, // sent, paid, overdue
          amount: Number(i.amount || 0),
          gstAmount: Number(i.gst_amount || 0),
          totalAmount: Number(i.total_amount || 0),
          dueDate: i.due_date ? new Date(i.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No Due Date',
          paymentLink: i.payment_link || '',
          description: i.description || ''
        }));
        setInvoices(formatted);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const filtered = invoices.filter(i => {
    const matchSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : i.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const totalSent = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.totalAmount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.totalAmount, 0);

  // ── Save Invoice ─────────────────────────────────────────
  const handleSaveInvoice = async (data: Record<string, any>) => {
    try {
      const payload = {
        client_id: data.client_id,
        project_id: data.project_id || null,
        amount: parseFloat(data.amount),
        gst_percent: Number(data.gst_percent),
        due_date: data.due_date || null,
        description: data.description || '',
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        loadInvoices();
      } else {
        const resData = await res.json().catch(() => ({}));
        alert(`Failed to generate invoice: ${resData.error || res.statusText || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
    }
    setModal(false);
  };

  // ── Delete Invoice ───────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to void/delete this invoice?')) {
      try {
        const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        loadInvoices();
      } catch (err) {
        console.error('Error deleting invoice:', err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {modal && (
        <InvoiceModal
          onClose={() => setModal(false)}
          onSave={handleSaveInvoice}
        />
      )}

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Freelancer'}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{today}</p>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          Invoices
        </h1>
        <button
          onClick={() => setModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Invoice
        </button>
      </div>

      {/* Main card */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px', overflow: 'hidden',
      }}>
        {/* Search + filter bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: '10px', alignItems: 'center',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} strokeWidth={1.8} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: '13.5px', color: 'var(--text-primary)', outline: 'none',
                background: 'var(--content-bg)',
              }}
            />
          </div>

          {/* Filter dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterMenu(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 14px', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', background: 'var(--card-bg)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={1.8} />
              Filter by Status
              <ChevronDown size={13} strokeWidth={2} />
            </button>
            {showFilterMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '42px', zIndex: 10,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                minWidth: '140px', overflow: 'hidden',
              }}>
                {(['all', 'sent', 'paid', 'overdue'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 14px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: filter === f ? 600 : 400,
                      background: filter === f ? 'var(--content-bg)' : 'var(--card-bg)',
                      color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {f === 'all' ? 'All Invoices' : f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 1.2fr',
          padding: '10px 20px', background: 'var(--content-bg)',
          borderBottom: '1px solid var(--border)', gap: '10px'
        }}>
          {['Invoice #', 'Client', 'Total Amount', 'Due Date', 'Status'].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: 'left' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows / Blank Slate */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          /* Premium Blank Slate Empty State Illustration */
          <div style={{
            padding: '60px 30px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px', color: 'var(--text-muted)'
            }}>
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Your invoices will be listed and shown here
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '380px', lineHeight: 1.5 }}>
              Generate invoices directly connected to Razorpay. Clients will receive reminders via WhatsApp and can pay securely in one click.
            </p>
            <button
              onClick={() => setModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'var(--text-primary)', color: 'var(--card-bg)',
                border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={14} strokeWidth={2.5} /> Create First Invoice
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No invoices matched your status filter.
          </div>
        ) : (
          filtered.map((inv, i) => {
            const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.sent;
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1fr 1fr 1.2fr',
                  padding: '14px 20px', alignItems: 'center', gap: '10px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Invoice Number */}
                <div>
                  <p style={{ fontWeight: 700, fontSize: '13px', margin: 0, color: 'var(--text-primary)' }}>
                    {inv.invoiceNumber}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {inv.projectName}
                  </p>
                </div>

                {/* Client */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {inv.clientName}
                </div>

                {/* Total Amount */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(inv.totalAmount)}
                </div>

                {/* Due Date */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {inv.dueDate}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    background: statusCfg.bg, color: statusCfg.color,
                    fontSize: '11px', fontWeight: 600,
                  }}>
                    <StatusIcon size={12} strokeWidth={2.5} />
                    {statusCfg.label}
                  </span>
                </div>


              </div>
            );
          })
        )}

        {/* Count */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center',
        }}>
          Showing {filtered.length} of {invoices.length} invoices
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <BarChart2 size={16} strokeWidth={1.8} color="var(--text-muted)" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>Invoice Metrics</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--success)', fontWeight: 700 }}>
          Paid: {formatCurrency(totalPaid)}
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: '#3B82F6', fontWeight: 700 }}>
          Sent: {formatCurrency(totalSent)}
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--error)', fontWeight: 700 }}>
          Overdue: {formatCurrency(totalOverdue)}
        </span>
      </div>
    </div>
  );
}
