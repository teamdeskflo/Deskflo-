'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { HeadphonesIcon, ShieldAlert, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface Ticket {
  id: string;
  user: string;
  email: string;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  created_at: string;
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-2093',
      user: 'Rohan Sharma',
      email: 'rohan@sharmadesign.co',
      issue: 'Unable to approve Figma link from client view, says "Link invalid" even when set to anyone can view.',
      priority: 'high',
      status: 'open',
      created_at: '2026-06-12T10:30:00Z',
    },
    {
      id: 'TCK-2092',
      user: 'Priya Patel',
      email: 'priya@patelventures.in',
      issue: 'GST calculation in invoice #INV-202606-0004 shows 18% instead of 12%. Need adjustment template.',
      priority: 'medium',
      status: 'open',
      created_at: '2026-06-11T14:20:00Z',
    },
    {
      id: 'TCK-2090',
      user: 'Vikram Singh',
      email: 'vikram@singhlabs.io',
      issue: 'Trial subscription expired warning appeared 2 days earlier than scheduled billing date.',
      priority: 'low',
      status: 'resolved',
      created_at: '2026-06-09T09:15:00Z',
    },
  ]);

  const resolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'resolved' as const } : t))
    );
  };

  const fmtDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>Support Center</h1>
          <p style={subtitle}>Inspect customer issues, platform bug reports, and ticket entries</p>
        </div>
      </div>

      <div style={grid}>
        {tickets.map(t => (
          <div key={t.id} style={card}>
            <div style={cardTop}>
              <span style={ticketId}>{t.id}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={priorityBadge(t.priority)}>{t.priority}</span>
                <span style={statusBadge(t.status)}>{t.status}</span>
              </div>
            </div>

            <div style={ticketIssue}>"{t.issue}"</div>

            <div style={divider} />

            <div style={ticketFooter}>
              <div style={userInfo}>
                <span style={userName}>{t.user}</span>
                <span style={userEmail}>{t.email}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={ticketDate}>{fmtDate(t.created_at)}</span>
                {t.status === 'open' && (
                  <button onClick={() => resolveTicket(t.id)} style={resolveBtn}>
                    <CheckCircle size={13} />
                    <span>Resolve Ticket</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

// ── Badges ──────────────────────────────────────────────────────────────────
const priorityBadge = (pri: string) => {
  const map: Record<string, React.CSSProperties> = {
    high: { background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' },
    medium: { background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' },
    low: { background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' },
  };
  return {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    padding: '2px 8px',
    borderRadius: '20px',
    ...(map[pri] || {}),
  };
};

const statusBadge = (stat: string) => {
  return {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    padding: '2px 8px',
    borderRadius: '20px',
    background: stat === 'open' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
    color: stat === 'open' ? '#F59E0B' : '#10B981',
  };
};

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

const grid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const card: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  padding: '24px',
};

const cardTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px',
};

const ticketId: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#C9940F',
};

const ticketIssue: React.CSSProperties = {
  fontSize: '14.5px',
  color: '#DEDAD5',
  lineHeight: 1.5,
  marginBottom: '16px',
};

const divider: React.CSSProperties = {
  height: '1px',
  background: '#232220',
  marginBottom: '16px',
};

const ticketFooter: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const userInfo: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const userName: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const userEmail: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6B6860',
};

const ticketDate: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6B6860',
};

const resolveBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '6px',
  color: '#10B981',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};
