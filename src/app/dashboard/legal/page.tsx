'use client';

import { useState } from 'react';
import {
  Search, Download, FileText, Mail, Eye, 
  Hourglass, CheckCircle2, XCircle, Scale,
  ChevronDown
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type LogStatus = 'approved' | 'viewed' | 'rejected' | 'unseen';

type ApprovalLog = {
  id: string;
  datetime: string;
  client: string;
  email: string;
  file: string;
  project: string;
  ip: string;
  location: string;
  device: string;
  status: LogStatus;
};

// ── Mock data ──
const INITIAL_LOGS: ApprovalLog[] = [
  { id: 'log1', datetime: '15 May 2026 · 2:34 PM', client: 'Rahul Sharma', email: 'rahul@web.com', file: 'logo_final.png', project: 'Website Redesign', ip: '103.52.14.23', location: 'Mumbai, India (approx)', device: 'Chrome on Windows', status: 'approved' },
  { id: 'log2', datetime: '14 May 2026 · 11:20 AM', client: 'Priya Patel', email: 'priya.p@design.co', file: 'homepage_v2.pdf', project: 'Brand Guidelines', ip: '203.18.45.02', location: 'Delhi, India (approx)', device: 'Safari on iPhone', status: 'approved' },
  { id: 'log3', datetime: '12 May 2026 · 5:45 PM', client: 'Vikram Singh', email: 'vikram@social.in', file: 'brand_guide.pdf', project: 'Social Media Kit', ip: '98.76.54.31', location: 'Bengaluru, India (approx)', device: 'Chrome on Mac', status: 'approved' },
  { id: 'log4', datetime: '10 May 2026 · 9:15 AM', client: 'ClientX Agency', email: 'contact@clientx.com', file: 'seo_report.pdf', project: 'Monthly SEO', ip: '45.22.78.66', location: 'Pune, India (approx)', device: 'Edge on Windows', status: 'viewed' },
  { id: 'log5', datetime: '08 May 2026 · 3:00 PM', client: 'Rahul Sharma', email: 'rahul@web.com', file: 'wireframe.png', project: 'Website Redesign', ip: '103.52.14.23', location: 'Mumbai, India (approx)', device: 'Chrome on Windows', status: 'approved' },
  { id: 'log6', datetime: '07 May 2026 · 1:15 PM', client: 'ClientX Agency', email: 'contact@clientx.com', file: 'ad_creatives.zip', project: 'May Campaign', ip: '45.22.78.66', location: 'Pune, India (approx)', device: 'Firefox on Mac', status: 'rejected' },
  { id: 'log7', datetime: '05 May 2026 · 10:00 AM', client: 'Priya Patel', email: 'priya.p@design.co', file: 'draft_v1.pdf', project: 'Brand Guidelines', ip: '-', location: '-', device: '-', status: 'unseen' },
];

const STATUS_CONFIG: Record<LogStatus, { label: string; icon: any; color: string; bg: string }> = {
  approved: { label: 'Approved', icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
  viewed:   { label: 'Viewed',   icon: Eye,          color: '#D4A017', bg: '#FDF8EC' },
  rejected: { label: 'Rejected', icon: XCircle,      color: '#EF4444', bg: '#FEE2E2' },
  unseen:   { label: 'Unseen',   icon: Hourglass,    color: 'var(--text-muted)', bg: '#F3F4F6' },
};

// ── Modal ───────────────────────────────
function CertificateModal({ log, onClose }: { log: ApprovalLog; onClose: () => void }) {
  
  const downloadCertificate = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Approval Certificate - ${log.file}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; background: #f9fafb; }
            .cert-box { background: white; max-width: 750px; margin: auto; padding: 50px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { display: flex; align-items: center; gap: 10px; font-size: 26px; font-weight: 900; letter-spacing: -1px; }
            .logo img { height: 36px; }
            .title { text-align: right; }
            .title h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; color: #111; }
            .title p { margin: 4px 0 0; font-size: 13px; color: #666; font-family: monospace; }
            .notice { background: #f3f4f6; padding: 16px; border-left: 4px solid #111; font-size: 14px; line-height: 1.6; margin-bottom: 30px; color: #333; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .field { margin-bottom: 15px; }
            .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #888; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 15px; font-weight: 600; color: #111; }
            .value.mono { font-family: monospace; font-size: 14px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
            .status-approved { background: #ECFDF5; color: #10B981; }
            .status-viewed { background: #FDF8EC; color: #D4A017; }
            .status-rejected { background: #FEE2E2; color: #EF4444; }
            .status-unseen { background: #F3F4F6; color: #6B7280; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888; font-family: monospace; }
            button { background: #111; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 14px; margin-top: 30px; transition: opacity 0.2s; }
            button:hover { opacity: 0.9; }
            .print-btn-container { text-align: center; }
            @media print { body { background: white; padding: 0; } .cert-box { box-shadow: none; border: none; padding: 0; } .print-btn-container { display: none; } }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="header">
              <div class="logo">
                <img src="${window.location.origin}/deskflo.png" alt="Deskflo" />
                DESKFLO
              </div>
              <div class="title">
                <h1>Approval Certificate</h1>
                <p>Log ID: ${log.id.toUpperCase()}-${Date.now().toString().slice(-6)}</p>
              </div>
            </div>

            <div class="notice">
              <strong>LEGAL NOTICE:</strong> This document serves as a cryptographically verifiable, legally admissible log of a digital client interaction. The IP address, device signature, and timestamp have been permanently recorded.
            </div>

            <div class="grid">
              <div>
                <div class="field">
                  <div class="label">Client Name</div>
                  <div class="value">${log.client}</div>
                </div>
                <div class="field">
                  <div class="label">Client Email</div>
                  <div class="value">${log.email}</div>
                </div>
                <div class="field">
                  <div class="label">Project Name</div>
                  <div class="value">${log.project}</div>
                </div>
                <div class="field">
                  <div class="label">File Approved</div>
                  <div class="value mono">${log.file}</div>
                </div>
              </div>
              
              <div>
                <div class="field">
                  <div class="label">Current Status</div>
                  <div class="value">
                    <span class="status status-${log.status}">${log.status}</span>
                  </div>
                </div>
                <div class="field">
                  <div class="label">Timestamp (IST)</div>
                  <div class="value mono">${log.datetime}</div>
                </div>
                <div class="field">
                  <div class="label">IP Address</div>
                  <div class="value mono">${log.ip}</div>
                </div>
                <div class="field">
                  <div class="label">Device & Location</div>
                  <div class="value">${log.device}<br><span style="font-size: 13px; color: #666; font-weight: 500;">${log.location}</span></div>
                </div>
              </div>
            </div>

            <div class="footer">
              Generated by Deskflo Client Portal Infrastructure<br>
              deskflo.in
            </div>
          </div>
          
          <div class="print-btn-container">
            <button onclick="window.print()">Print / Save as PDF</button>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          padding: '28px', width: '100%', maxWidth: '520px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
          <Scale size={18} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Certificate Preview</h2>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'var(--card-bg)', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          {`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         APPROVAL LOG SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File: ${log.file}
Client: ${log.client}

Status: ${log.status.toUpperCase()}
Time: ${log.datetime}
IP: ${log.ip}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Close</button>
          <button 
            onClick={downloadCertificate}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          ><Download size={14} /> Open Full Certificate</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function LegalPage() {
  const user = useUser();
  const [logs, setLogs] = useState<ApprovalLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState<string>('All');
  const [viewLog, setViewLog] = useState<ApprovalLog | null>(null);

  const clients = Array.from(new Set(logs.map(l => l.client)));

  const filtered = logs.filter(log => {
    const matchSearch =
      log.file.toLowerCase().includes(search.toLowerCase()) ||
      log.client.toLowerCase().includes(search.toLowerCase());
    const matchClient = filterClient === 'All' ? true : log.client === filterClient;
    return matchSearch && matchClient;
  });

  const totalApprovals = logs.filter(l => l.status === 'approved').length;
  const uniqueClients = clients.length;
  const thisMonth = logs.filter(l => l.datetime.includes('May 2026')).length; // mock logic

  const downloadCSV = () => {
    const headers = ['Date & Time', 'Client', 'Email', 'File', 'Project', 'IP Address', 'Location', 'Device', 'Status'];
    const csvRows = logs.map(l => [
      l.datetime, `"${l.client}"`, l.email, l.file, `"${l.project}"`, l.ip, `"${l.location}"`, `"${l.device}"`, l.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...csvRows.map(r => r.join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'deskflo_approval_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Legal Approval Logs</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 20px; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; text-align: left; }
            th, td { border: 1px solid #ddd; padding: 10px; }
            th { background-color: #f3f4f6; text-transform: uppercase; font-size: 11px; color: #555; }
            .status { font-weight: 700; text-transform: uppercase; font-size: 11px; }
            button { background: #111; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; margin-top: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
            <div>
              <h1 style="margin:0 0 5px;">Deskflo - Legal Approval Logs</h1>
              <p style="margin:0; font-size: 12px; color: #666;">Generated on: ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Client</th>
                <th>File</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td>${l.datetime}</td>
                  <td>${l.client}</td>
                  <td style="font-family: monospace;">${l.file}</td>
                  <td style="font-family: monospace;">${l.ip}</td>
                  <td class="status">${l.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button onclick="window.print()">Print / Save as PDF</button>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const emailSummary = () => {
    const subject = encodeURIComponent("Deskflo Legal Logs Summary");
    const body = encodeURIComponent(`Here is the summary of your Deskflo legal approval logs:\n\nTotal Approvals: ${totalApprovals}\nUnique Clients: ${uniqueClients}\nThis Month: ${thisMonth}\n\nPlease log in to your Deskflo dashboard to view or export the full IP logs.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {viewLog && (
        <CertificateModal log={viewLog} onClose={() => setViewLog(null)} />
      )}

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
          Welcome back, {user.name.split(' ')[0]}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          Legal (Approval Logs)
        </h1>
        <button
          onClick={downloadCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Download size={15} strokeWidth={2.5} />
          Export All
        </button>
      </div>

      {/* Main card */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px', overflow: 'hidden',
      }}>
        {/* Search + filter bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: '10px', alignItems: 'center',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} strokeWidth={1.8} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search approvals..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: '13.5px', color: 'var(--text-primary)', outline: 'none',
                background: 'var(--content-bg)',
              }}
            />
          </div>

          <select
            value={filterClient}
            onChange={e => setFilterClient(e.target.value)}
            style={{
              padding: '9px 14px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', background: 'var(--card-bg)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
              outline: 'none'
            }}
          >
            <option value="All">Filter by Client</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1fr 1fr 80px',
          padding: '10px 20px', background: 'var(--content-bg)',
          borderBottom: '1px solid var(--border)', gap: '10px'
        }}>
          {['Date & Time', 'Client', 'File', 'IP Address', 'Status', ''].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No logs found.
          </div>
        ) : (
          filtered.map((log, i) => {
            const statusCfg = STATUS_CONFIG[log.status];
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={log.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1.5fr 1fr 1fr 80px',
                  padding: '14px 20px', alignItems: 'center', gap: '10px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {log.datetime}
                </div>

                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {log.client}
                </div>

                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace' }}>
                  {log.file}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {log.ip}
                </div>

                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                    background: statusCfg.bg, color: statusCfg.color,
                    fontSize: '11.5px', fontWeight: 600,
                  }}>
                    <StatusIcon size={12} strokeWidth={2.5} />
                    {statusCfg.label}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => setViewLog(log)}
                    style={{
                      background: 'var(--content-bg)', border: '1px solid var(--border)',
                      padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                      fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Count */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--content-bg)',
          fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500
        }}>
          Showing {filtered.length} of {logs.length} approvals
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* Legal Summary Box */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="var(--text-muted)" /> Legal Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Approvals:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{totalApprovals}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Unique Clients:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{uniqueClients}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>This Month:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{thisMonth}</strong>
            </div>
          </div>
        </div>

        {/* How to Use Box */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--text-muted)" /> How to Use This for Disputes
          </h3>
          <ol style={{ margin: '0 0 20px', paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <li>Screenshot or export this log via the buttons below.</li>
            <li>Show client the exact timestamp + IP address of their approval.</li>
            <li><strong>Legal proof</strong> = Client cannot deny they clicked the approval link.</li>
          </ol>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={downloadCSV} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}><Download size={14} /> Download CSV</button>
            <button onClick={downloadAllPDF} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}><FileText size={14} /> Download PDF</button>
            <button onClick={emailSummary} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}><Mail size={14} /> Email Legal Summary</button>
          </div>
        </div>

      </div>
    </div>
  );
}
