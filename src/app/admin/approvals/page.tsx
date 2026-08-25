'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { CheckCircle2, AlertTriangle, HelpCircle, Eye, ShieldAlert, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface ApprovalLogItem {
  id: string;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  files: {
    file_name: string;
    file_url: string;
    projects: {
      name: string;
      users: { name: string };
    };
  } | null;
  clients: {
    name: string;
    company_name: string | null;
  } | null;
}

export default function ApprovalsLog() {
  const [logs, setLogs] = useState<ApprovalLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<'all' | 'approved' | 'rejected' | 'viewed'>('all');
  const [page, setPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState(false);

  const limit = 25;

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/approvals?action=${actionFilter}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setLogs(data.approvals || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching approval logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [actionFilter, page]);

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>Approval Audits</h1>
          <p style={subtitle}>Monitor client approvals and review logs for all file deliverables</p>
        </div>
      </div>

      <div style={filterBar}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)} style={filterBtn}>
            <SlidersHorizontal size={14} />
            <span>Action: {actionFilter.toUpperCase()}</span>
            <ChevronDown size={14} />
          </button>
          {showDropdown && (
            <div style={dropdown}>
              {(['all', 'approved', 'rejected', 'viewed'] as const).map(act => (
                <button
                  key={act}
                  onClick={() => { setActionFilter(act); setPage(1); setShowDropdown(false); }}
                  style={{
                    ...dropdownItem,
                    fontWeight: actionFilter === act ? 700 : 400,
                    color: actionFilter === act ? '#DEDAD5' : '#9E9B94',
                    background: actionFilter === act ? '#232220' : 'transparent',
                  }}
                >
                  {act.charAt(0).toUpperCase() + act.slice(1)} Logs
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <span>File / Project</span>
          <span>Client &amp; Freelancer</span>
          <span>Action Type</span>
          <span>IP Address</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div style={loadingState}>Loading audits...</div>
        ) : logs.length === 0 ? (
          <div style={emptyState}>No approval activity matching this filter.</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={log.id}
              style={{
                ...tableRow,
                borderBottom: idx < logs.length - 1 ? '1px solid #232220' : 'none',
              }}
            >
              <div style={fileCol}>
                <span style={fileName}>{log.files?.file_name || 'Deleted Deliverable'}</span>
                <span style={projectName}>{log.files?.projects?.name || 'Deleted Project'}</span>
              </div>

              <div style={clientCol}>
                <span style={clientName}>{log.clients?.name || '—'}</span>
                <span style={freelancerName}>by {log.files?.projects?.users?.name || '—'}</span>
              </div>

              <div>
                {log.action === 'approved' && (
                  <span style={approvedBadge}>
                    <CheckCircle2 size={12} /> Approved
                  </span>
                )}
                {log.action === 'rejected' && (
                  <span style={rejectedBadge}>
                    <AlertTriangle size={12} /> Rejected
                  </span>
                )}
                {log.action === 'viewed' && (
                  <span style={viewedBadge}>
                    <HelpCircle size={12} /> Viewed
                  </span>
                )}
              </div>

              <div style={ipCol}>{log.ip_address || '—'}</div>

              <div style={dateCol}>{fmtDate(log.created_at)}</div>
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
  gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.6fr',
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
  gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.6fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
};

const fileCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const fileName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const projectName: React.CSSProperties = {
  fontSize: '11px',
  color: '#6B6860',
};

const clientCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const clientName: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#DEDAD5',
  fontWeight: 500,
};

const freelancerName: React.CSSProperties = {
  fontSize: '11px',
  color: '#6B6860',
};

const approvedBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(16, 185, 129, 0.12)',
  color: '#10B981',
};

const rejectedBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(239, 68, 68, 0.12)',
  color: '#EF4444',
};

const viewedBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(59, 130, 246, 0.12)',
  color: '#3B82F6',
};

const ipCol: React.CSSProperties = {
  fontSize: '13.5px',
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
