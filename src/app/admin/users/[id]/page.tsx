'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { ArrowLeft, User, Briefcase, Receipt, ShieldAlert, Ban, Trash2, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';

interface DetailUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  logo_url: string | null;
  brand_color: string;
  subscription_status: string;
  billing_plan: string;
  created_at: string;
  is_active?: boolean;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  created_at: string;
}

interface ProjectData {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  deadline: string | null;
  created_at: string;
  clients: { name: string };
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  due_date: string | null;
  created_at: string;
}

interface LogData {
  id: string;
  action: string;
  metadata: any;
  created_at: string;
}

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<DetailUser | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) {
        alert('User details could not be found');
        router.push('/admin/users');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setClients(data.clients);
      setProjects(data.projects);
      setInvoices(data.invoices);
      setLogs(data.activityLogs);
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleStatus = async () => {
    if (!user) return;
    const currentStatus = user.is_active !== false;

    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user account?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update user status');
      }
    } catch {
      alert('Error updating user status');
    }
  };

  const deleteUser = async () => {
    if (!confirm('WARNING: Are you sure you want to delete this user? This will permanently erase their profile and account details!')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/users');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user');
      }
    } catch {
      alert('Error deleting user');
    }
  };

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

  if (loading) {
    return (
      <AdminLayout>
        <div style={loadingWrap}>Loading account details...</div>
      </AdminLayout>
    );
  }

  if (!user) return null;

  return (
    <AdminLayout>
      {/* ── Breadcrumb Header ────────────────────────────────────────────── */}
      <div style={header}>
        <Link href="/admin/users" style={backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Users</span>
        </Link>
        <div style={titleRow}>
          <div>
            <h1 style={title}>{user.name}</h1>
            <p style={subtitle}>Detailed profile, activities, and operational statistics</p>
          </div>
          <div style={headerActions}>
            <button onClick={toggleStatus} style={user.is_active !== false ? suspendBtn : activateBtn}>
              <Ban size={15} />
              <span>{user.is_active !== false ? 'Suspend Freelancer' : 'Activate Freelancer'}</span>
            </button>
            <button onClick={deleteUser} style={deleteBtn}>
              <Trash2 size={15} />
              <span>Wipe Profile</span>
            </button>
          </div>
        </div>
      </div>

      <div style={dashboardGrid}>
        {/* ── Left Column — Profile Summary ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={panel}>
            <h2 style={panelTitle}>
              <User size={16} color="#C9940F" />
              Profile Details
            </h2>
            <div style={profileRows}>
              <div style={profileRow}>
                <span style={profileLabel}>Email Address</span>
                <span style={profileVal}>{user.email}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Phone Number</span>
                <span style={profileVal}>{user.phone || '—'}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Company Name</span>
                <span style={profileVal}>{user.company_name || '—'}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Access Status</span>
                <span style={user.is_active !== false ? greenText : redText}>
                  {user.is_active !== false ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Billing Plan</span>
                <span style={profileValBadge}>{user.billing_plan}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Subscription</span>
                <span style={profileVal}>{user.subscription_status}</span>
              </div>
              <div style={profileRow}>
                <span style={profileLabel}>Joined Date</span>
                <span style={profileVal}>{fmtDate(user.created_at)}</span>
              </div>
            </div>
          </div>

          <div style={panel}>
            <h2 style={panelTitle}>
              <Clock size={16} color="#C9940F" />
              Freelancer Activity Log
            </h2>
            <div style={logsWrap}>
              {logs.length === 0 ? (
                <div style={emptyLogs}>No recent actions recorded.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} style={logItem}>
                    <div style={logDot} />
                    <div style={{ flex: 1 }}>
                      <div style={logAction}>{log.action.replace(/_/g, ' ')}</div>
                      <div style={logDate}>{fmtDate(log.created_at)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column — Relations Tables ────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Projects Table */}
          <div style={panel}>
            <h2 style={panelTitle}>
              <Briefcase size={16} color="#C9940F" />
              Client Projects ({projects.length})
            </h2>
            {projects.length === 0 ? (
              <div style={emptyMessage}>No active projects found.</div>
            ) : (
              <div style={listContainer}>
                <div style={listHeader3}>
                  <span>Project Name</span>
                  <span>Client</span>
                  <span>Budget</span>
                </div>
                {projects.map(p => (
                  <div key={p.id} style={listItem3}>
                    <span style={itemBold}>{p.name}</span>
                    <span>{p.clients?.name || '—'}</span>
                    <span style={budgetVal}>{p.budget ? formatCurrency(p.budget) : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices Table */}
          <div style={panel}>
            <h2 style={panelTitle}>
              <Receipt size={16} color="#C9940F" />
              Billing Invoices ({invoices.length})
            </h2>
            {invoices.length === 0 ? (
              <div style={emptyMessage}>No billing invoices issued yet.</div>
            ) : (
              <div style={listContainer}>
                <div style={listHeader3}>
                  <span>Invoice #</span>
                  <span>Total Amount</span>
                  <span>Status</span>
                </div>
                {invoices.map(inv => (
                  <div key={inv.id} style={listItem3}>
                    <span style={itemBold}>{inv.invoice_number}</span>
                    <span>{formatCurrency(inv.total_amount)}</span>
                    <span style={badgeStyle(inv.status)}>{inv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Badge Style Helper ──────────────────────────────────────────────────────
const badgeStyle = (status: string) => {
  const map: Record<string, React.CSSProperties> = {
    paid: { background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
    sent: { background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' },
    overdue: { background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' },
  };
  return {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    display: 'inline-block',
    textAlign: 'center' as const,
    width: 'fit-content',
    ...(map[status] || { background: '#232220', color: '#9E9B94' }),
  };
};

// ── Styles ──────────────────────────────────────────────────────────────────
const loadingWrap: React.CSSProperties = {
  padding: '60px 0',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '14px',
};

const header: React.CSSProperties = {
  marginBottom: '32px',
};

const backBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#9E9B94',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '16px',
};

const titleRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
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

const headerActions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const actionBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #2E2C29',
  background: '#1B1A18',
  color: '#DEDAD5',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const suspendBtn: React.CSSProperties = {
  ...actionBtn,
  background: 'rgba(245, 158, 11, 0.1)',
  color: '#F59E0B',
  borderColor: 'rgba(245, 158, 11, 0.3)',
};

const activateBtn: React.CSSProperties = {
  ...actionBtn,
  background: 'rgba(16, 185, 129, 0.1)',
  color: '#10B981',
  borderColor: 'rgba(16, 185, 129, 0.3)',
};

const deleteBtn: React.CSSProperties = {
  ...actionBtn,
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#EF4444',
  borderColor: 'rgba(239, 68, 68, 0.3)',
};

const dashboardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 2fr',
  gap: '24px',
  '@media (max-width: 767px)': {
    gridTemplateColumns: '1fr',
  },
} as any;

const panel: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  padding: '24px',
};

const panelTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#DEDAD5',
  margin: '0 0 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const profileRows: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const profileRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '10px',
  borderBottom: '1px solid #232220',
};

const profileLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#9E9B94',
};

const profileVal: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const profileValBadge: React.CSSProperties = {
  ...profileVal,
  textTransform: 'capitalize',
  background: '#232220',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '11px',
};

const greenText: React.CSSProperties = {
  ...profileVal,
  color: '#10B981',
};

const redText: React.CSSProperties = {
  ...profileVal,
  color: '#EF4444',
};

const logsWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const logItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
};

const logDot: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#C9940F',
  marginTop: '5px',
  flexShrink: 0,
};

const logAction: React.CSSProperties = {
  fontSize: '13px',
  color: '#DEDAD5',
  textTransform: 'capitalize',
};

const logDate: React.CSSProperties = {
  fontSize: '11px',
  color: '#6B6860',
  marginTop: '2px',
};

const emptyLogs: React.CSSProperties = {
  fontSize: '13px',
  color: '#6B6860',
  textAlign: 'center',
  padding: '12px 0',
};

const listContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  background: '#141413',
  borderRadius: '8px',
  border: '1px solid #232220',
  overflow: 'hidden',
};

const listHeader3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 1.4fr 1fr',
  padding: '10px 16px',
  background: '#232220',
  fontSize: '11px',
  fontWeight: 700,
  color: '#9E9B94',
  textTransform: 'uppercase',
};

const listItem3: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 1.4fr 1fr',
  padding: '12px 16px',
  borderBottom: '1px solid #232220',
  fontSize: '13px',
  alignItems: 'center',
};

const itemBold: React.CSSProperties = {
  fontWeight: 600,
  color: '#DEDAD5',
};

const budgetVal: React.CSSProperties = {
  color: '#10B981',
  fontWeight: 600,
};

const emptyMessage: React.CSSProperties = {
  padding: '24px 0',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '13.5px',
};
