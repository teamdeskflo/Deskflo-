'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Search, ChevronDown, SlidersHorizontal, Eye, Ban, ShieldAlert, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UserItem {
  id: string;
  name: string;
  email: string;
  company_name: string | null;
  plan: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const limit = 25;

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&status=${status}&page=${page}&limit=${limit}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [search, status, page]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user account?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update user status');
      }
    } catch {
      alert('Error updating user status');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('WARNING: Are you sure you want to delete this user? This will permanently erase their profile and account details!')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user');
      }
    } catch {
      alert('Error deleting user');
    }
  };

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>User Management</h1>
          <p style={subtitle}>Monitor and control freelancer accounts and access permissions</p>
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div style={filterBar}>
        <div style={searchWrapper}>
          <Search size={16} color="#6B6860" style={searchIcon} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search freelancers by name, email, or company..."
            style={searchInput}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowFilter(!showFilter)} style={filterBtn}>
            <SlidersHorizontal size={14} />
            <span>Filter Status</span>
            <ChevronDown size={14} />
          </button>
          {showFilter && (
            <div style={dropdown}>
              {(['all', 'active', 'suspended'] as const).map(s => (
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
                  {s.charAt(0).toUpperCase() + s.slice(1)} Accounts
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table Grid ─────────────────────────────────────────────────── */}
      <div style={tableCard}>
        <div style={tableHeader}>
          <span>Name &amp; Email</span>
          <span>Company Name</span>
          <span>Joined Date</span>
          <span>Access Status</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {loading ? (
          <div style={loadingState}>Loading accounts...</div>
        ) : users.length === 0 ? (
          <div style={emptyState}>No freelancers found matching this criteria.</div>
        ) : (
          users.map((u, idx) => (
            <div
              key={u.id}
              style={{
                ...tableRow,
                borderBottom: idx < users.length - 1 ? '1px solid #232220' : 'none',
              }}
            >
              <div style={nameCol}>
                <div style={userName}>{u.name}</div>
                <div style={userEmail}>{u.email}</div>
              </div>

              <div style={companyCol}>{u.company_name || '—'}</div>

              <div style={dateCol}>{fmtDate(u.created_at)}</div>

              <div>
                {u.is_active !== false ? (
                  <span style={activeBadge}>Active</span>
                ) : (
                  <span style={suspendedBadge}>Suspended</span>
                )}
              </div>

              <div style={actionsCol}>
                <Link href={`/admin/users/${u.id}`} style={actionBtn} title="View Profile">
                  <Eye size={14} />
                </Link>
                <button
                  onClick={() => toggleStatus(u.id, u.is_active !== false)}
                  style={u.is_active !== false ? actionBtnSuspend : actionBtnActivate}
                  title={u.is_active !== false ? 'Suspend Account' : 'Activate Account'}
                >
                  <Ban size={14} />
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  style={actionBtnDelete}
                  title="Wipe Profile"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {total > limit && (
          <div style={pagination}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={pageBtn}
            >
              Previous
            </button>
            <span style={pageSpan}>Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              style={pageBtn}
            >
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
  flexWrap: 'wrap',
};

const searchWrapper: React.CSSProperties = {
  flex: 1,
  minWidth: '280px',
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
  right: 0,
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
  gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 1.3fr',
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
  gridTemplateColumns: '2.5fr 1.5fr 1.5fr 1.2fr 1.3fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
};

const nameCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const userName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const userEmail: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B6860',
};

const companyCol: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#9E9B94',
};

const dateCol: React.CSSProperties = {
  fontSize: '13.5px',
  color: '#9E9B94',
};

const activeBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(16, 185, 129, 0.12)',
  color: '#10B981',
};

const suspendedBadge: React.CSSProperties = {
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(239, 68, 68, 0.12)',
  color: '#EF4444',
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
  textDecoration: 'none',
};

const actionBtnSuspend: React.CSSProperties = {
  ...actionBtn,
  color: '#F59E0B',
  borderColor: 'rgba(245, 158, 11, 0.3)',
  background: 'rgba(245, 158, 11, 0.05)',
};

const actionBtnActivate: React.CSSProperties = {
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
