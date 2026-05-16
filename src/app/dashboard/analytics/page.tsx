'use client';

import { useState } from 'react';
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
  const max = Math.max(...data) * 1.1; // Add 10% headroom
  const min = 0;
  const width = 400;
  const height = 120;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '160px' }}>
      {/* Y-Axis Labels (Rough estimation) */}
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
          <polyline fill="none" stroke={color} strokeWidth="3" points={points} strokeLinejoin="round" strokeLinecap="round" />

          {/* Points */}
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min)) * height;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="white" stroke={color} strokeWidth="2" />
                {/* Data label on points (optional, showing on last point) */}
                {i === data.length - 1 && (
                  <text x={x} y={y - 10} fontSize="12" fontWeight="bold" fill="var(--text-primary)" textAnchor="end">
                    {formatValue(val)}
                  </text>
                )}
                {/* Data label on 3rd point just like the design */}
                {i === 2 && (
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const downloadCSV = () => {
    const headers = ['Metric', 'Value'];
    const csvRows = [
      ['Revenue', '45000'],
      ['Approval Rate', '87%'],
      ['Files Uploaded', '24'],
      ['Pending Approvals', '6']
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows.map(r => r.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'deskflo_analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Data
  const trendLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = [18000, 20000, 25000, 32000, 40000, 45000];
  const approvalData = [45, 50, 55, 68, 75, 87];

  const topClients = [
    { name: 'Rahul Sharma', amount: '₹25k' },
    { name: 'Priya Patel', amount: '₹18k' },
    { name: 'Vikram Singh', amount: '₹12k' },
    { name: 'ClientX Agency', amount: '₹8k' },
    { name: 'Neha Gupta', amount: '₹5k' },
  ];

  const topProjects = [
    { name: 'Website Redesign', amount: '₹30k' },
    { name: 'Social Media Kit', amount: '₹15k' },
    { name: 'SEO Audit', amount: '₹10k' },
    { name: 'Logo Package', amount: '₹8k' },
    { name: 'Brand Guide', amount: '₹5k' },
  ];

  // Generate insights based on the selected date range and data
  const generateInsights = () => {
    const insights = [];

    // Simulate dynamic variations based on dateRange selection
    const factor = dateRange === 'Last 7 Days' ? 0.3 : dateRange === 'Last 90 Days' ? 2 : 1;
    const revUp = Math.floor(23 * factor);
    const appDrop = Math.floor(8 / factor);

    // Approval insight
    if (appDrop > 5) {
      insights.push({
        icon: CircleAlert, color: '#EF4444', bg: '#FEE2E2',
        text: `Your approval rate dropped by ${appDrop}% this period. Send reminders to pending files.`
      });
    } else {
      insights.push({
        icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5',
        text: `Approval rate is strong and stable at ${approvalData[approvalData.length - 1]}%. Great client communication!`
      });
    }

    // Revenue insight
    if (revUp > 0) {
      insights.push({
        icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5',
        text: `Revenue up ${revUp}% this period! Outstanding job!`
      });
    } else {
      insights.push({
        icon: CircleAlert, color: '#F59E0B', bg: '#FFFBEB',
        text: `Revenue is slightly down. Consider upselling your top clients like ${topClients[0].name}.`
      });
    }

    // Overdue insight
    const overdue = dateRange === 'This Month' ? 3 : dateRange === 'Last 7 Days' ? 1 : Math.floor(5 * factor);
    if (overdue > 0) {
      insights.push({
        icon: CircleAlert, color: '#F59E0B', bg: '#FFFBEB',
        text: `${overdue} invoices are currently overdue. Send payment reminders.`
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
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Month</option>
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
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>₹45,000</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>This Month</span>
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', fontWeight: 600 }}><TrendingUp size={14} style={{ marginRight: '2px' }} /> 23% vs last month</span>
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
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>87%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', fontWeight: 600 }}>+12% from last month</span>
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
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>24</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>This Month</span>
            <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', fontWeight: 600 }}><TrendingDown size={14} style={{ marginRight: '2px' }} /> 8% vs last month</span>
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
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '4px' }}>6</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Need your attention</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topClients.map((client, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{idx + 1}. {client.name}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{client.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Briefcase size={16} color="#D4A017" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>TOP PROJECTS</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProjects.map((project, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{idx + 1}. {project.name}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{project.amount}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Auto-Generated Insights */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart2 size={16} color="#10B981" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>INSIGHTS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dynamicInsights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text-primary)' }}>
                <Icon size={16} color={insight.color} style={{ marginTop: '2px', flexShrink: 0 }} fill={insight.bg} />
                <span>{insight.text}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
