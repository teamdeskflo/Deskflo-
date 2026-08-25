'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Search, Trash2, Mail } from 'lucide-react';

interface WaitlistItem {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string;
}

export default function WaitlistApplicants() {
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const limit = 25;

  async function loadWaitlist() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/waitlist?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setWaitlist(data.waitlist || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching waitlist:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWaitlist();
  }, [search, page]);

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to remove this applicant from the waitlist?')) return;

    try {
      const res = await fetch(`/api/admin/waitlist?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadWaitlist();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to remove applicant');
      }
    } catch {
      alert('Error deleting waitlist entry');
    }
  };

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>Waitlist Management</h1>
          <p style={subtitle}>Review and invite applicants waiting for platform registration</p>
        </div>
      </div>

      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={16} color="#6B6860" style={searchIcon} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search waitlisted applicants by name or email..."
            style={searchInput}
          />
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <span>Name</span>
          <span>Email Address</span>
          <span>Role / Profile</span>
          <span>Joined Waitlist</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {loading ? (
          <div style={loadingState}>Loading applicants...</div>
        ) : waitlist.length === 0 ? (
          <div style={emptyState}>No waitlisted applicants found.</div>
        ) : (
          waitlist.map((item, idx) => (
            <div
              key={item.id}
              style={{
                ...tableRow,
                borderBottom: idx < waitlist.length - 1 ? '1px solid #232220' : 'none',
              }}
            >
              <span style={itemBold}>{item.name || '—'}</span>
              <span>{item.email}</span>
              <span style={roleText}>{item.role || 'Freelancer'}</span>
              <span>{fmtDate(item.created_at)}</span>

              <div style={actionsCol}>
                <button
                  onClick={() => alert(`Sending signup invitation link to: ${item.email}`)}
                  style={actionBtnInvite}
                  title="Invite Applicant"
                >
                  <Mail size={14} />
                </button>
                <button
                  onClick={() => deleteEntry(item.id)}
                  style={actionBtnDelete}
                  title="Remove Applicant"
                >
                  <Trash2 size={14} />
                </button>
              </div>
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
  display: 'flex',
  gap: '12px',
  marginBottom: '20px',
};

const searchWrapper: React.CSSProperties = {
  flex: 1,
  position: 'relative',
};

const searchIcon: React.CSSProperties = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
};

const searchInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px 10px 40px',
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  color: '#DEDAD5',
  fontSize: '13.5px',
  outline: 'none',
  boxSizing: 'border-box',
};

const tableCard: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  overflow: 'hidden',
};

const tableHeader: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1fr',
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
  gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
};

const itemBold: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const roleText: React.CSSProperties = {
  fontSize: '13px',
  color: '#9E9B94',
  textTransform: 'capitalize',
};

const actionsCol: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  justifyContent: 'flex-end',
};

const actionBtn: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: '1px solid #2E2C29',
  background: '#141413',
  color: '#DEDAD5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const actionBtnInvite: React.CSSProperties = {
  ...actionBtn,
  color: '#10B981',
  borderColor: 'rgba(16, 185, 129, 0.3)',
  background: 'rgba(16, 185, 129, 0.05)',
};

const actionBtnDelete: React.CSSProperties = {
  ...actionBtn,
  color: '#EF4444',
  borderColor: 'rgba(239, 68, 68, 0.3)',
  background: 'rgba(239, 68, 68, 0.05)',
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
