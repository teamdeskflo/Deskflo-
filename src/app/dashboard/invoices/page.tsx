'use client';

import { useState } from 'react';
import {
  Search, SlidersHorizontal, Plus, Trash2,
  BarChart2, ChevronDown, Link as LinkIcon,
  Clock, CheckCircle2, AlertCircle, FileText, Check
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type InvoiceStatus = 'pending' | 'paid' | 'overdue';

type Invoice = {
  id: string; // e.g. INV-001
  client: string;
  amount: string; // Stored as raw number string
  status: InvoiceStatus;
  dueDate: string;
};

// ── Mock data ──
const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-001', client: 'Rahul Sharma',   amount: '5000',  status: 'pending', dueDate: '20 May' },
  { id: 'INV-002', client: 'Priya Patel',    amount: '12000', status: 'paid',    dueDate: '15 May' },
  { id: 'INV-003', client: 'Vikram Singh',   amount: '8000',  status: 'pending', dueDate: '30 May' },
  { id: 'INV-004', client: 'ClientX Agency', amount: '25000', status: 'overdue', dueDate: '10 May' },
  { id: 'INV-005', client: 'Rahul Sharma',   amount: '3000',  status: 'paid',    dueDate: '05 May' },
];

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock,        color: '#D4A017', bg: '#FDF8EC' },
  paid:    { label: 'Paid',    icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
  overdue: { label: 'Overdue', icon: AlertCircle,  color: '#EF4444', bg: '#FEE2E2' },
};

// Formatting helper
const formatCurrency = (amount: string) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// ── Copy Link Component ───────────────────────────────
function CopyLinkButton({ invoiceId }: { invoiceId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`deskflo.in/pay/${invoiceId.toLowerCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy Payment Link"
      style={{
        width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)', background: 'var(--card-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-secondary)', transition: 'all 0.12s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = copied ? 'var(--success)' : 'var(--text-primary)'; e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = copied ? 'var(--success)' : 'var(--text-secondary)'; }}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <LinkIcon size={14} strokeWidth={1.8} />}
    </button>
  );
}

// ── Add / Edit Modal ───────────────────────────────
function InvoiceModal({ onClose, onSave, nextId }: { onClose: () => void; onSave: (inv: Invoice) => void; nextId: string }) {
  const [formData, setFormData] = useState({
    id: nextId,
    client: '',
    amount: '',
    status: 'pending' as InvoiceStatus,
    dueDate: '',
  });

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
          padding: '28px', width: '100%', maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          Create New Invoice
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Invoice ID (Readonly) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Invoice Number
            </label>
            <input
              value={formData.id}
              disabled
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-muted)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Client Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Client Name
            </label>
            <input
              value={formData.client}
              onChange={e => setFormData({ ...formData, client: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Amount
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="5000"
                style={{
                  width: '100%', padding: '9px 12px 9px 24px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Due Date
            </label>
            <input
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              placeholder="e.g. 20 May"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.client || !formData.amount || !formData.dueDate) return alert('Please fill in all fields');
              onSave(formData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >Create Invoice</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function InvoicesPage() {
  const user = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = invoices.filter(inv => {
    const matchSearch =
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : inv.status === filter;
    return matchSearch && matchFilter;
  });

  // Calculate stats
  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleSaveInvoice = (newInv: Invoice) => {
    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
    
    // Simulate generating and downloading a PDF
    setTimeout(() => {
      alert(`Invoice ${newInv.id} generated successfully! A PDF has been prepared for the client.`);
    }, 300);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleViewPDF = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    // Generate a clean HTML invoice document on the fly
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${inv.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; background: #f9fafb; }
            .invoice-box { background: white; max-width: 700px; margin: auto; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); font-size: 15px; line-height: 24px; }
            table { width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; }
            table td { padding: 8px; vertical-align: top; }
            table tr.top table td { padding-bottom: 30px; }
            table tr.heading td { background: #f3f4f6; border-bottom: 1px solid #e5e7eb; font-weight: 600; padding: 12px 8px; }
            table tr.item td { border-bottom: 1px solid #f3f4f6; padding: 16px 8px; }
            table tr.total td { padding-top: 16px; }
            table tr.total td:nth-child(2) { border-top: 2px solid #e5e7eb; font-weight: 700; font-size: 18px; }
            .right { text-align: right; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .status-pending { background: #FDF8EC; color: #D4A017; }
            .status-paid { background: #ECFDF5; color: #10B981; }
            .status-overdue { background: #FEE2E2; color: #EF4444; }
            button { background: #111; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; }
            button:hover { opacity: 0.9; }
            @media print { body { background: white; padding: 0; } .invoice-box { box-shadow: none; padding: 0; } button { display: none; } }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table>
              <tr class="top">
                <td colspan="2">
                  <table>
                    <tr>
                      <td style="font-size:28px; font-weight:800; letter-spacing: -1px; display: flex; alignItems: center; gap: 8px;">
                        <img src="${window.location.origin}/deskflo.png" style="height: 32px;" alt="" />
                        DESKFLO
                      </td>
                      <td class="right">
                        <span class="status status-${inv.status}">${inv.status}</span><br><br>
                        <strong>Invoice #:</strong> ${inv.id}<br>
                        <strong>Due Date:</strong> ${inv.dueDate}<br>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <table>
                    <tr>
                      <td>
                        <strong>Billed To:</strong><br>
                        ${inv.client}
                      </td>
                      <td class="right">
                        <strong>From:</strong><br>
                        ${user.name}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="heading">
                <td>Item / Description</td>
                <td class="right">Amount</td>
              </tr>
              <tr class="item">
                <td>Freelance Services Rendered</td>
                <td class="right">&#8377;${Number(inv.amount).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total">
                <td></td>
                <td class="right">Total: &#8377;${Number(inv.amount).toLocaleString('en-IN')}</td>
              </tr>
            </table>
            <div style="margin-top: 40px; text-align: center;">
              <button onclick="window.print()">Print / Save as PDF</button>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a Blob from the HTML and open it in a new tab
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Determine next invoice ID
  const nextIdNum = invoices.length > 0 
    ? Math.max(...invoices.map(i => parseInt(i.id.split('-')[1]))) + 1 
    : 1;
  const nextId = `INV-${nextIdNum.toString().padStart(3, '0')}`;

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {isModalOpen && (
        <InvoiceModal
          nextId={nextId}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveInvoice}
        />
      )}

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
          Welcome back, {user.name.split(' ')[0]}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          Invoices
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
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
                {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
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
                    {f === 'all' ? 'All Statuses' : f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr auto',
          padding: '10px 20px', background: 'var(--content-bg)',
          borderBottom: '1px solid var(--border)', gap: '10px'
        }}>
          {['Invoice #', 'Client', 'Amount', 'Status', 'Due Date', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Actions' ? 'right' : 'left' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No invoices found.
          </div>
        ) : (
          filtered.map((inv, i) => {
            const statusCfg = STATUS_CONFIG[inv.status];
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={inv.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr auto',
                  padding: '14px 20px', alignItems: 'center', gap: '10px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Invoice ID */}
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  {inv.id}
                </div>

                {/* Client */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {inv.client}
                </div>

                {/* Amount */}
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatCurrency(inv.amount)}
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

                {/* Due Date */}
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {inv.dueDate}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button
                    title="View PDF"
                    onClick={() => handleViewPDF(inv.id)}
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <FileText size={14} strokeWidth={1.8} />
                  </button>
                  
                  <CopyLinkButton invoiceId={inv.id} />

                  <button
                    title="Delete invoice"
                    onClick={() => handleDelete(inv.id)}
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid #FECACA', background: '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--error)', transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
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

      {/* Payment Summary */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <BarChart2 size={16} strokeWidth={1.8} color="var(--text-muted)" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>Payment Summary</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Total Invoiced: <strong>{formatCurrency(totalInvoiced.toString())}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--success)' }}>
          Paid: <strong>{formatCurrency(totalPaid.toString())}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--error)', fontWeight: 700 }}>
          Pending: {formatCurrency(totalPending.toString())}
        </span>
      </div>
    </div>
  );
}
