'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Users, Briefcase, CheckCircle2, Receipt, Hourglass, ArrowUpRight,
  TrendingUp, Activity, UserPlus, FileText
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  pendingApprovals: number;
  totalInvoices: number;
  newSignups: number;
  waitlistCount: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const formatRevenue = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = stats
    ? [
        {
          label: 'Total Users',
          value: stats.totalUsers,
          subText: `${stats.newSignups} new this week`,
          icon: Users,
          color: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.1)',
        },
        {
          label: 'Active Projects',
          value: stats.totalProjects,
          subText: 'Running client projects',
          icon: Briefcase,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.1)',
        },
        {
          label: 'Pending Approvals',
          value: stats.pendingApprovals,
          subText: 'Files awaiting client review',
          icon: Hourglass,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.1)',
        },
        {
          label: 'Total Paid Volume',
          value: formatRevenue(stats.totalRevenue),
          subText: `From ${stats.totalInvoices} invoices`,
          icon: TrendingUp,
          color: '#8B5CF6',
          bg: 'rgba(139, 92, 246, 0.1)',
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>System Overview</h1>
          <p style={subtitle}>Live platform activity and statistics dashboard</p>
        </div>
      </div>

      {loading ? (
        <div style={loadingState}>Loading metrics...</div>
      ) : (
        <>
          {/* ── Metric Cards Grid ────────────────────────────────────────── */}
          <div style={grid}>
            {cards.map(c => {
              const Icon = c.icon;
              return (
                <div key={c.label} style={card}>
                  <div style={cardHeader}>
                    <span style={cardLabel}>{c.label}</span>
                    <div style={{ ...iconWrapper, background: c.bg }}>
                      <Icon size={18} color={c.color} />
                    </div>
                  </div>
                  <div style={cardValue}>{c.value}</div>
                  <div style={cardSub}>{c.subText}</div>
                </div>
              );
            })}
          </div>

          {/* ── Quick Modules List ───────────────────────────────────────── */}
          <div style={panelsGrid}>
            <div style={panel}>
              <h2 style={panelTitle}>
                <Activity size={18} color="#C9940F" />
                Quick Operations
              </h2>
              <div style={linkList}>
                <Link href="/admin/users" style={opLink}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} />
                    <span>Manage Freelancer Accounts</span>
                  </div>
                  <ArrowUpRight size={16} color="#6B6860" />
                </Link>

                <Link href="/admin/waitlist" style={opLink}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserPlus size={16} />
                    <span>Waitlisted Applicants ({stats?.waitlistCount})</span>
                  </div>
                  <ArrowUpRight size={16} color="#6B6860" />
                </Link>

                <Link href="/admin/approvals" style={opLink}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={16} />
                    <span>Deliverable Approval Audits</span>
                  </div>
                  <ArrowUpRight size={16} color="#6B6860" />
                </Link>

                <Link href="/admin/invoices" style={opLink}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Receipt size={16} />
                    <span>System Revenue &amp; Billing</span>
                  </div>
                  <ArrowUpRight size={16} color="#6B6860" />
                </Link>
              </div>
            </div>

            <div style={panel}>
              <h2 style={panelTitle}>
                <FileText size={18} color="#C9940F" />
                Administrative Summary
              </h2>
              <div style={summaryBody}>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Registration Status</span>
                  <span style={summaryValueGreen}>Open</span>
                </div>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Active Session Limit</span>
                  <span style={summaryValue}>30 mins (Rolling)</span>
                </div>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Security Layer</span>
                  <span style={summaryValue}>Signed Token HTTP Cookie</span>
                </div>
                <div style={summaryRow}>
                  <span style={summaryLabel}>Pending Invitations</span>
                  <span style={summaryValue}>{stats?.waitlistCount}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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

const loadingState: React.CSSProperties = {
  padding: '60px 0',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '14px',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px',
  marginBottom: '32px',
};

const card: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
};

const cardHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '14px',
};

const cardLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#9E9B94',
};

const iconWrapper: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardValue: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 800,
  color: '#DEDAD5',
  margin: '0 0 6px',
};

const cardSub: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B6860',
};

const panelsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
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
  fontSize: '16px',
  fontWeight: 700,
  color: '#DEDAD5',
  margin: '0 0 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const linkList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const opLink: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  background: '#141413',
  border: '1px solid #232220',
  borderRadius: '8px',
  color: '#DEDAD5',
  textDecoration: 'none',
  fontSize: '13.5px',
  fontWeight: 500,
  transition: 'border-color 0.15s, transform 0.1s',
};

const summaryBody: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const summaryRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: '12px',
  borderBottom: '1px solid #232220',
};

const summaryLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#9E9B94',
};

const summaryValue: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const summaryValueGreen: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#10B981',
};
