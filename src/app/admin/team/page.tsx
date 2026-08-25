'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ShieldAlert, UserPlus, Trash2, KeyRound } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, type AdminRole } from '@/lib/admin/rbac';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('support');
  const [error, setError] = useState('');

  async function loadTeam() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      if (!res.ok) {
        setError('You do not have permission to view team settings.');
        return;
      }
      const data = await res.json();
      setTeam(data.team || []);
    } catch {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to create team member');
        return;
      }

      setName('');
      setEmail('');
      setPassword('');
      setRole('support');
      setAdding(false);
      loadTeam();
    } catch {
      setError('Connection failure.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this administrator account? Access will be revoked immediately.')) return;

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadTeam();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete member');
      }
    } catch {
      alert('Error deleting account.');
    }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>Team Management</h1>
          <p style={subtitle}>Create and configure role-based access for system operators and admins</p>
        </div>
        {!adding && !error && (
          <button onClick={() => setAdding(true)} style={addBtn}>
            <UserPlus size={15} />
            <span>Add Admin Member</span>
          </button>
        )}
      </div>

      {error && <div style={errorBanner}>{error}</div>}

      {/* ── Add Operator Card / Form ────────────────────────────────────── */}
      {adding && (
        <div style={panel}>
          <h2 style={panelTitle}>Add Administrative Account</h2>
          <form onSubmit={handleAdd} style={form}>
            <div style={formRow}>
              <div style={inputGroup}>
                <label style={label}>Full Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Anil Kumar"
                  required
                  style={input}
                />
              </div>
              <div style={inputGroup}>
                <label style={label}>Operator Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@deskflo.in"
                  required
                  style={input}
                />
              </div>
            </div>

            <div style={formRow}>
              <div style={inputGroup}>
                <label style={label}>Temporary Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={input}
                />
              </div>
              <div style={inputGroup}>
                <label style={label}>Role Scope</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as AdminRole)}
                  style={selectInput}
                >
                  <option value="support">Support Operator</option>
                  <option value="finance">Finance Operator</option>
                  <option value="operations">Operations Operator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
            </div>

            <div style={formActions}>
              <button type="button" onClick={() => setAdding(false)} style={cancelBtn}>
                Cancel
              </button>
              <button type="submit" style={submitBtn}>
                Create Operator
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Operator List Table ─────────────────────────────────────────── */}
      {!error && (
        <div style={tableCard}>
          <div style={tableHeader}>
            <span>Name &amp; Email</span>
            <span>Security Role</span>
            <span>Created Date</span>
            <span>Last Login</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {loading ? (
            <div style={loadingState}>Loading operators...</div>
          ) : team.length === 0 ? (
            <div style={emptyState}>No administrators created.</div>
          ) : (
            team.map((member, idx) => {
              const rLabel = ROLE_LABELS[member.role] || member.role;
              const rColor = ROLE_COLORS[member.role] || { bg: '#232220', color: '#9E9B94' };

              return (
                <div
                  key={member.id}
                  style={{
                    ...tableRow,
                    borderBottom: idx < team.length - 1 ? '1px solid #232220' : 'none',
                  }}
                >
                  <div style={nameCol}>
                    <span style={userName}>{member.name}</span>
                    <span style={userEmail}>{member.email}</span>
                  </div>

                  <div>
                    <span style={{ ...roleBadge, background: rColor.bg, color: rColor.color }}>
                      {rLabel}
                    </span>
                  </div>

                  <span>{fmtDate(member.created_at)}</span>

                  <span>{fmtDate(member.last_login_at)}</span>

                  <div style={actionsCol}>
                    <button
                      onClick={() => handleDelete(member.id)}
                      style={actionBtnDelete}
                      title="Wipe Access"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </AdminLayout>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const header: React.CSSProperties = {
  marginBottom: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
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

const addBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: '#C9940F',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(201, 148, 15, 0.2)',
};

const errorBanner: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  color: '#EF4444',
  fontSize: '13.5px',
  padding: '12px 16px',
  marginBottom: '24px',
};

const panel: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
};

const panelTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#DEDAD5',
  marginBottom: '20px',
};

const form: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const formRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  '@media (max-width: 767px)': {
    gridTemplateColumns: '1fr',
  },
} as any;

const inputGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const label: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#9E9B94',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#141413',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  color: '#DEDAD5',
  fontSize: '13.5px',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectInput: React.CSSProperties = {
  ...input,
  cursor: 'pointer',
};

const formActions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '12px',
};

const cancelBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: 'none',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  color: '#9E9B94',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const submitBtn: React.CSSProperties = {
  padding: '10px 18px',
  background: '#C9940F',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 700,
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
  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
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
  gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 1fr',
  padding: '16px 24px',
  alignItems: 'center',
  transition: 'background 0.15s',
  fontSize: '13.5px',
};

const nameCol: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const userName: React.CSSProperties = {
  fontWeight: 600,
  color: '#DEDAD5',
};

const userEmail: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B6860',
};

const roleBadge: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase',
};

const actionsCol: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const actionBtnDelete: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  background: 'rgba(239, 68, 68, 0.05)',
  color: '#EF4444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
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
