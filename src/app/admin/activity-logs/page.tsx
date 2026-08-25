'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ShieldAlert, Terminal, Calendar } from 'lucide-react';

interface AuditLog {
  id: string;
  admin_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const limit = 25;

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/activity-logs?page=${page}&limit=${limit}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [page]);

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
          <h1 style={title}>Audit &amp; Activity Logs</h1>
          <p style={subtitle}>Track and inspect all administrative operations, updates, and actions</p>
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <span>Admin Operator</span>
          <span>Action Performed</span>
          <span>Target Entity</span>
          <span>IP Address</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div style={loadingState}>Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div style={emptyState}>No administrative actions logged yet.</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={log.id}
              style={{
                ...tableRow,
                borderBottom: idx < logs.length - 1 ? '1px solid #232220' : 'none',
              }}
            >
              <span style={itemBold}>{log.admin_email || 'System'}</span>

              <div style={actionCol}>
                <Terminal size={12} color="#6B6860" />
                <span style={actionText}>{log.action.replace(/_/g, ' ')}</span>
              </div>

              <span style={targetText}>
                {log.target_type ? `${log.target_type} (${log.target_id?.slice(0, 8)})` : '—'}
              </span>

              <span>{log.ip_address || '—'}</span>

              <span>{fmtDate(log.created_at)}</span>
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

const tableCard: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  overflow: 'hidden',
};

const tableHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 2fr 1.5fr 1.2fr 1.5fr',
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
  gridTemplateColumns: '1.8fr 2fr 1.5fr 1.2fr 1.5fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
  fontSize: '13px',
};

const itemBold: React.CSSProperties = {
  fontWeight: 600,
  color: '#DEDAD5',
};

const actionCol: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const actionText: React.CSSProperties = {
  textTransform: 'capitalize',
  color: '#DEDAD5',
};

const targetText: React.CSSProperties = {
  color: '#9E9B94',
  fontSize: '12.5px',
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
