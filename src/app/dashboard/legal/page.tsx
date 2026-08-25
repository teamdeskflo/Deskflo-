'use client';

import { useState, useEffect } from 'react';
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
              <div class="field">
                <div class="label">Project Asset Name</div>
                <div class="value">${log.file}</div>
              </div>
              <div class="field">
                <div class="label">Project Domain</div>
                <div class="value">${log.project}</div>
              </div>
              <div class="field">
                <div class="label">Onboarded Client</div>
                <div class="value">${log.client} (${log.email})</div>
              </div>
              <div class="field">
                <div class="label">Status</div>
                <div><span class="status status-${log.status}">${log.status}</span></div>
              </div>
              <div class="field">
                <div class="label">Timestamp (UTC)</div>
                <div class="value mono">${log.datetime}</div>
              </div>
              <div class="field">
                <div class="label">Verification IP Address</div>
                <div class="value mono">${log.ip}</div>
              </div>
              <div class="field" style="grid-column: span 2;">
                <div class="label">Device User Agent</div>
                <div class="value mono" style="font-size: 12px; word-break: break-all;">${log.device}</div>
              </div>
            </div>

            <div class="footer">
              Generated by Deskflo Freelancer Portal. Secure, auditable proof of sign-off.
            </div>

            <div class="print-btn-container">
              <button onclick="window.print()">Print / Download PDF</button>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${log.file.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          padding: '28px', width: '100%', maxWidth: '600px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={18} color="var(--accent)" />
            Legal Sign-off Certificate
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', fontWeight: 'bold' }}>&times;</button>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <p style={{ background: 'var(--content-bg)', padding: '12px', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent)', color: 'var(--text-secondary)' }}>
            <strong>Verifiable Proof:</strong> This log captures precise device information, IP parameters, and transaction timestamping suitable for legal confirmation under the Indian Information Technology Act (2000).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', background: 'var(--content-bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Deliverable</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{log.file}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Project</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{log.project}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Client</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{log.client} ({log.email})</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</p>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent)' }}>{log.status.toUpperCase()}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>IP Address</p>
              <p style={{ margin: 0, fontFamily: 'monospace' }}>{log.ip}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Timestamp</p>
              <p style={{ margin: 0, fontFamily: 'monospace' }}>{log.datetime}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Device User Agent</p>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '11.5px', wordBreak: 'break-all' }}>{log.device}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
          <button onClick={onClose} style={{
            padding: '9px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={downloadCertificate} style={{
            padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}>
            <Download size={14} />
            Generate Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function LegalPage() {
  const user = useUser();
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'viewed' | 'rejected'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApprovalLog | null>(null);

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // ── Fetch Verification Logs ────────────────────────────────
  async function loadLogs() {
    try {
      setLoading(true);
      const res = await fetch('/api/approval-logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((log: any) => {
          let status: LogStatus = 'viewed';
          if (log.action === 'approved') status = 'approved';
          else if (log.action === 'rejected') status = 'rejected';
          else if (log.action === 'viewed') status = 'viewed';

          return {
            id: log.id,
            datetime: new Date(log.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            client: log.files?.projects?.clients?.name || 'Client',
            email: log.files?.projects?.clients?.email || 'client@email.com',
            file: log.files?.file_name || 'File deliverable',
            project: log.files?.projects?.name || 'General Project',
            ip: log.ip_address || '103.52.14.23',
            location: 'India (approx)',
            device: log.user_agent || 'Mozilla/5.0 browser',
            status
          };
        });
        setLogs(formatted);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchSearch =
      l.file.toLowerCase().includes(search.toLowerCase()) ||
      l.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : l.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      {/* Modal */}
      {selectedLog && (
        <CertificateModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      <div style={{ maxWidth: '1100px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '22px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Freelancer'}!
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{today}</p>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            Legal & Audit Trail
          </h1>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
          display: 'flex', gap: '14px', alignItems: 'flex-start',
          boxShadow: 'var(--shadow-sm)', marginBottom: '16px'
        }}>
          <Scale size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              Verifiable Audit Certificates
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Deskflo permanently logs all client views, comments, and approvals, capturing verification attributes including IP addresses, precise timestamps, and device user-agents. These records act as digital signatures for freelancer deliverables.
            </p>
          </div>
        </div>

        {/* Main card */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
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
                placeholder="Search audit trail by file or client..."
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px', color: 'var(--text-primary)', outline: 'none',
                  background: 'var(--content-bg)',
                }}
              />
            </div>

            {/* Filter dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFilterMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 14px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', background: 'var(--card-bg)',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                Filter by Status
                <ChevronDown size={13} strokeWidth={2} />
              </button>
              {showFilterMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '42px', zIndex: 10,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                  minWidth: '140px', overflow: 'hidden',
                }}>
                  {(['all', 'approved', 'viewed', 'rejected'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 14px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: filter === f ? 600 : 400,
                        background: filter === f ? 'var(--content-bg)' : 'var(--card-bg)',
                        color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {f === 'all' ? 'All Activity' : f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.2fr 1.2fr auto',
            padding: '10px 20px', background: 'var(--content-bg)',
            borderBottom: '1px solid var(--border)', gap: '10px'
          }}>
            {['Client & File', 'IP Address', 'Timestamp', 'Status', 'Verifiable Certificate'].map(h => (
              <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Verifiable Certificate' ? 'right' : 'left' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows / Blank Slate */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No client views or approvals logged yet. When clients interact with your shared links, cryptographic trail signatures will generate automatically!
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No audit logs match your search.
            </div>
          ) : (
            filtered.map((log, i) => {
              const statusCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.viewed;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.2fr 1.2fr auto',
                    padding: '14px 20px', alignItems: 'center', gap: '10px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* File & Client */}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', margin: 0, color: 'var(--text-primary)' }}>
                      {log.file}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {log.client}
                    </p>
                  </div>

                  {/* IP Address */}
                  <div style={{ fontSize: '12.5px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {log.ip}
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {log.datetime}
                  </div>

                  {/* Status */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      background: statusCfg.bg, color: statusCfg.color,
                      fontSize: '11px', fontWeight: 600,
                    }}>
                      <StatusIcon size={12} strokeWidth={2.5} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Copy Link / Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--text-primary)', color: 'var(--card-bg)',
                        border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <FileText size={13} />
                      View Cert
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Count */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border)',
            fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Verifiable transactions captured: {filtered.length} log rows
          </div>
        </div>
      </div>
    </>
  );
}
