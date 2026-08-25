'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { SlidersHorizontal, ChevronDown, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface InvoiceItem {
  id: string;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  status: string;
  due_date: string | null;
  created_at: string;
  clients: { name: string; company_name: string | null } | null;
  users: { name: string } | null;
}

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'paid' | 'overdue' | 'sent' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const limit = 25;

  async function loadInvoices() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices?status=${status}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setInvoices(data.invoices || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, [status, page]);

  const fmtDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>System Billing</h1>
          <p style={subtitle}>Track and inspect invoices, GST calculations, and payment operations</p>
        </div>
      </div>

      <div style={filterBar}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowFilter(!showFilter)} style={filterBtn}>
            <SlidersHorizontal size={14} />
            <span>Status: {status.toUpperCase()}</span>
            <ChevronDown size={14} />
          </button>
          {showFilter && (
            <div style={dropdown}>
              {(['all', 'paid', 'sent', 'overdue', 'draft'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); setShowFilter(false); }}
                  style={{
                    ...dropdownItem,
                    fontWeight: status === s ? 700 : 400,
                    color: status === s ? '#DEDAD5' : '#9E9B94',
                    background: status === s ? '#232220' : 'transparent',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)} Invoices
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <span>Invoice #</span>
          <span>Freelancer (Issuer)</span>
          <span>Client (Billed)</span>
          <span>Amounts (Total / GST)</span>
          <span>Status</span>
          <span>Due Date</span>
        </div>

        {loading ? (
          <div style={loadingState}>Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div style={emptyState}>No billing entries found matching status filter.</div>
        ) : (
          invoices.map((inv, idx) => (
            <div
              key={inv.id}
              style={{
                ...tableRow,
                borderBottom: idx < invoices.length - 1 ? '1px solid #232220' : 'none',
              }}
            >
              <span style={invoiceNum}>{inv.invoice_number}</span>

              <span style={freelancerName}>{inv.users?.name || 'Deleted Account'}</span>

              <span style={clientName}>{inv.clients?.name || 'Deleted Client'}</span>

              <div style={amountCol}>
                <span style={totalAmount}>{formatCurrency(inv.total_amount)}</span>
                <span style={gstAmount}>GST: {formatCurrency(inv.gst_amount)}</span>
              </div>

              <div>
                {inv.status === 'paid' && (
                  <span style={paidBadge}>Paid</span>
                )}
                {inv.status === 'sent' && (
                  <span style={sentBadge}>Sent</span>
                )}
                {inv.status === 'overdue' && (
                  <span style={overdueBadge}>Overdue</span>
                )}
                {inv.status === 'draft' && (
                  <span style={draftBadge}>Draft</span>
                )}
              </div>

              <span style={dateCol}>{fmtDate(inv.due_date)}</span>
            </div>
          ))
        )}

        {total > limit && (
          <div style={pagination}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)} style={pageBtn}>
              Previous
            </button>
            <span style={pageSpan}>Page {page} of {Math.ceil(total / limit)}</span>
            <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} style={pageBtn}>
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const header: React.CSSProperties = {
  marginBottom: '32px',
};

const title: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: '#DEDAD5',
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
};

const subtitle: React.CSSProperties = {
  fontSize: '14px',
  color: '#9E9B94',
  margin: 0,
};

const filterBar: React.CSSProperties = {
  marginBottom: '20px',
};

const filterBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  color: '#9E9B94',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};

const dropdown: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '42px',
  width: '180px',
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  zIndex: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  padding: '4px',
};

const dropdownItem: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '8px 12px',
  border: 'none',
  borderRadius: '6px',
  background: 'none',
  fontSize: '12.5px',
  cursor: 'pointer',
};

const tableCard: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  overflow: 'hidden',
};

const tableHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.6fr 1.6fr 1.4fr 1.2fr 1.2fr',
  padding: '14px 24px',
  background: '#141413',
  borderBottom: '1px solid #2E2C29',
  fontSize: '12px',
  fontWeight: 700,
  color: '#9E9B94',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1.6fr 1.6fr 1.4fr 1.2fr 1.2fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
};

const invoiceNum: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const freelancerName: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#DEDAD5',
};

const clientName: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#DEDAD5',
};

const amountCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const totalAmount: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#10B981',
};

const gstAmount: React.CSSProperties = {
  fontSize: '11px',
  color: '#6B6860',
};

const paidBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(16, 185, 129, 0.12)',
  color: '#10B981',
};

const sentBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(59, 130, 246, 0.12)',
  color: '#3B82F6',
};

const overdueBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(239, 68, 68, 0.12)',
  color: '#EF4444',
};

const draftBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: '#232220',
  color: '#9E9B94',
};

const dateCol: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#9E9B94',
};

const loadingState: React.CSSProperties = {
  padding: '40px',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '14px',
};

const emptyState: React.CSSProperties = {
  padding: '40px',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '14px',
};

const pagination: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 24px',
  background: '#141413',
  borderTop: '1px solid #2E2C29',
};

const pageBtn: React.CSSProperties = {
  padding: '6px 12px',
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '6px',
  color: '#DEDAD5',
  fontSize: '12.5px',
  cursor: 'pointer',
};

const pageSpan: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#9E9B94',
};
