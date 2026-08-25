'use client';

import { useState, useEffect } from 'react';
import {
  Download, RefreshCcw, TrendingUp, TrendingDown, IndianRupee,
  CheckCircle2, FolderOpen, Hourglass, Trophy, Briefcase,
  BarChart2, CircleAlert, ChevronDown
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Custom SVG Line Chart Component ──
function TrendChart({
  data, labels, color, formatValue
}: {
  data: number[], labels: string[], color: string, formatValue: (val: number) => string
}) {
  const max = Math.max(...data, 1000) * 1.1; // Add 10% headroom
  const min = 0;
  const width = 400;
  const height = 120;

  const points = data.length > 0 
    ? data.map((val, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
        const y = height - ((val - min) / (max - min)) * height;
        return `${x},${y}`;
      }).join(' ')
    : `0,${height} ${width},${height}`;

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '160px' }}>
      {/* Y-Axis Labels */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
        <span>{formatValue(max)}</span>
        <span>{formatValue(max / 2)}</span>
        <span>0</span>
      </div>

      <div style={{ position: 'absolute', left: '35px', right: 0, top: 0, bottom: '20px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="var(--border-light)" strokeWidth="1" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border-light)" strokeWidth="1" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="var(--border-light)" strokeWidth="1" />

          {/* Area Fill */}
          <polygon points={areaPoints} fill={`url(#grad-${color})`} />

          {/* Line */}
          <polyline fill="none" stroke={color} strokeWidth={3} points={points} strokeLinejoin="round" strokeLinecap="round" />

          {/* Points */}
          {data.map((val, i) => {
            const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
            const y = height - ((val - min) / (max - min)) * height;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                {i === data.length - 1 && (
                  <text x={x} y={y - 10} fontSize="12" fontWeight="bold" fill="var(--text-primary)" textAnchor="end">
                    {formatValue(val)}
                  </text>
                )}
                {i === 2 && data.length > 2 && (
                  <text x={x} y={y - 10} fontSize="12" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">
                    {formatValue(val)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* X-Axis Labels */}
      <div style={{ position: 'absolute', left: '35px', right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {labels.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const user = useUser();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState<any>({
    revenue: { total: 0, pending: 0, overdue: 0, monthly: [] },
    projects: { total: 0, active: 0, completed: 0 },
    clients: { total: 0, top: [] },
    files: { total: 0, approved: 0, approvalRate: 0 },
    tasks: { pending: 0, overdue: 0 },
  });

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data && !data.error) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
  };

  const downloadCSV = () => {
    const headers = ['Metric', 'Value'];
    const csvRows = [
      ['Total Paid Revenue', String(stats.revenue?.total || 0)],
      ['Approval Rate', `${stats.files?.approvalRate || 0}%`],
      ['Total Files Uploaded', String(stats.files?.total || 0)],
      ['Pending Approvals', String(stats.files?.total - stats.files?.approved || 0)]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'deskflo_analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trend Data mapping from monthly list
  const monthlyList = stats.revenue?.monthly || [];
  const trendLabels = monthlyList.length > 0 ? monthlyList.map((m: any) => m.month) : ['-', '-', '-', '-', '-', '-'];
  const revenueData = monthlyList.length > 0 ? monthlyList.map((m: any) => m.revenue) : [0, 0, 0, 0, 0, 0];
  
  // Approximation of approval trends for styling (flat rate or mapped logs)
  const approvalData = [
    stats.files?.approvalRate || 0,
    stats.files?.approvalRate || 0,
    stats.files?.approvalRate || 0,
    stats.files?.approvalRate || 0,
    stats.files?.approvalRate || 0,
    stats.files?.approvalRate || 0
  ];

  // Top clients list
  const topClients = (stats.clients?.top || []).map((tc: any) => ({
    name: tc.name,
    amount: `₹${Number(tc.revenue).toLocaleString('en-IN')}`
  }));

  // Generate actionable insights
  const generateInsights = () => {
    const insights = [];

    const approvalRate = stats.files?.approvalRate || 0;
    if (approvalRate < 80 && stats.files?.total > 0) {
      insights.push({
        icon: CircleAlert, color: '#EF4444', bg: '#FEE2E2',
        text: `Your approval rate is currently at ${approvalRate}%. Consider sending reminders for pending files.`
      });
    } else {
      insights.push({
        icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5',
        text: `Approval rate is healthy at ${approvalRate}%. Excellent client alignment!`
      });
    }

    if (stats.revenue?.overdue > 0) {
      insights.push({
        icon: CircleAlert, color: '#F59E0B', bg: '#FFFBEB',
        text: `${stats.revenue?.overdue} invoices are currently overdue. Send payment links immediately.`
      });
    }

    if (stats.revenue?.total === 0) {
      insights.push({
        icon: Briefcase, color: '#6366F1', bg: '#EEF2FF',
        text: `Welcome to Deskflo! Share your first deliverable or create an invoice to populate analytics.`
      });
    }

    return insights;
  };

  const dynamicInsights = generateInsights();

  return (
    <div style={{ width: '100%' }}>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            Analytics
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Date Range:
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, outline: 'none', background: 'var(--card-bg)' }}
              >
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
                background: 'var(--content-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
                transition: 'all 0.2s', opacity: isRefreshing ? 0.6 : 1
              }}
            >
              <RefreshCcw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        <button
          onClick={downloadCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.15s',
          }}
        >
          <Download size={15} strokeWidth={2.5} />
          Export Report
        </button>
      </div>

      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

      {/* Top 4 Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>

        {/* Revenue */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: '#FDF8EC', borderRadius: 'var(--radius-sm)' }}>
              <IndianRupee size={14} color="#D4A017" strokeWidth={2.5} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>REVENUE</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>
            ₹{(stats.revenue?.total || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>All Time Revenue</span>
          </div>
        </div>

        {/* Approval Rate */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: '#ECFDF5', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={14} color="#10B981" strokeWidth={2.5} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>APPROVAL RATE</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>
            {stats.files?.approvalRate || 0}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Files Approved: {stats.files?.approved || 0} / {stats.files?.total || 0}</span>
          </div>
        </div>

        {/* Files Uploaded */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: '#FDF3DC', borderRadius: 'var(--radius-sm)' }}>
              <FolderOpen size={14} color="#D4A017" strokeWidth={2.5} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>FILES UPLOADED</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>
            {stats.files?.total || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Deliverables active in Deskflo</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: '#FFFBEB', borderRadius: 'var(--radius-sm)' }}>
              <Hourglass size={14} color="#F59E0B" strokeWidth={2.5} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>PENDING APPROVALS</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>
            {stats.files?.total - stats.files?.approved || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Awaiting client feedback</span>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>

        {/* Revenue Trend */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <TrendingUp size={16} color="#D4A017" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>REVENUE TREND</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>(Last 6 Months)</span>
          </div>
          <TrendChart
            data={revenueData} labels={trendLabels} color="#8b8c8f"
            formatValue={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
          />
        </div>

        {/* Approval Trend */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', background: '#ECFDF5', borderRadius: '4px' }}>
              <CheckCircle2 size={12} color="#10B981" strokeWidth={3} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>APPROVAL TREND</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>(Last 6 Months)</span>
          </div>
          <TrendChart
            data={approvalData} labels={trendLabels} color="#8b8c8f"
            formatValue={(v) => `${v}%`}
          />
        </div>
      </div>

      {/* Lists Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>

        {/* Top Clients */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Trophy size={16} color="#D4A017" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>TOP CLIENTS</span>
          </div>
          {topClients.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No payments received yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topClients.map((client: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{client.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Action Insights */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart2 size={16} color="#D4A017" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>ACTION INSIGHTS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dynamicInsights.map((ins, i) => {
              const IconComp = ins.icon;
              return (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', background: ins.bg, borderRadius: 'var(--radius-md)', border: `1px solid ${ins.color}25` }}>
                  <IconComp size={16} color={ins.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{ins.text}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
