'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClientLayout, { useClientPortal } from '@/components/layout/ClientLayout';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, CheckCircle2, AlertCircle, 
  Download, Loader2, Award, Calendar, ExternalLink,
  CreditCard, DollarSign, ArrowUpRight, Clock, Lock
} from 'lucide-react';

function getPlatformFromUrl(url: string): 'drive' | 'dropbox' | 'onedrive' | 'figma' | 'notion' | 'unknown' {
  if (!url) return 'unknown';
  const lUrl = url.toLowerCase();
  if (lUrl.includes('google.com/drive') || lUrl.includes('drive.google.com') || lUrl.includes('docs.google.com')) return 'drive';
  if (lUrl.includes('dropbox.com')) return 'dropbox';
  if (lUrl.includes('onedrive.live.com') || lUrl.includes('sharepoint.com') || lUrl.includes('1drv.ms') || lUrl.includes('live.com')) return 'onedrive';
  if (lUrl.includes('figma.com')) return 'figma';
  if (lUrl.includes('notion.so') || lUrl.includes('notion.site')) return 'notion';
  return 'unknown';
}

function PlatformIcon({ url, size = 20, style }: { url: string; size?: number; style?: React.CSSProperties }) {
  const platform = getPlatformFromUrl(url);
  const iconStyle = { flexShrink: 0, ...style };
  switch (platform) {
    case 'drive':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} style={iconStyle}>
          <path d="M19.43 12.98l-5.74-9.94c-.38-.66-1.07-1.04-1.83-1.04H6.14c-.76 0-1.45.38-1.83 1.04l-3.26 5.64c-.38.66-.38 1.48 0 2.14l5.74 9.94c.38.66 1.07 1.04 1.83 1.04h11.96c.76 0 1.45-.38 1.83-1.04l3.26-5.64c.38-.66.38-1.48 0-2.14zm-7.61.52H6.14l5.74-9.94 5.68 9.84-5.74.1z" fill="#4285F4" />
          <path d="M6.14 13.5l5.74 9.94-5.74-9.94z" fill="#0F9D58" />
          <path d="M11.88 3.56l5.68 9.84-11.42.1 5.74-9.94z" fill="#FFC107" />
        </svg>
      );
    case 'dropbox':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#0061FE" style={iconStyle}>
          <path d="M5.98 2L1 5.42l4.98 3.42 4.98-3.42L5.98 2zm12.04 0L13 5.42l5.02 3.42L23 5.42 18.02 2zM1 12.23l4.98 3.42 4.98-3.42L5.98 8.8 1 12.23zm17.02-3.43L13 12.23l5.02 3.42L23 12.23l-4.98-3.43zM12 12.63l-4.98-3.43 4.98-3.41 5.02 3.41-5.02 3.43zm-6.02 3.8v2.54l6.02 3.43 6.02-3.43v-2.54l-6.02 3.42-6.02-3.42z" />
        </svg>
      );
    case 'onedrive':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#0078D4" style={iconStyle}>
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z" />
        </svg>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 16 24" width={size} height={size * 1.5} style={iconStyle}>
          <path d="M4 4c0-2.21 1.79-4 4-4h4v8H8C5.79 8 4 6.21 4 4z" fill="#F24E1E" />
          <path d="M4 12c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4z" fill="#A259FF" />
          <path d="M4 20c0-2.21 1.79-4 4-4s4 1.79 4 4v4H8c-2.21 0-4-1.79-4-4z" fill="#1ABC9C" />
          <path d="M12 8c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4v8h4z" fill="#FF7262" />
          <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4v8h4z" fill="#5551FF" />
        </svg>
      );
    case 'notion':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" style={iconStyle}>
          <rect x="3" y="3" width="18" height="18" rx="3.5" fill="#000000" />
          <path d="M7 8V16M7 8L12.5 13.5V8M12.5 13.5L17 8V16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <FileText size={size} color="var(--text-muted)" style={iconStyle} />;
  }
}

type InvoiceItem = {
  id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  gst_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_link: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

type FileItem = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
};

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function ProjectDetail() {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  const { projects, branding } = useClientPortal();
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const project = projects.find(p => p.id === projectId);
  const primaryColor = branding?.brandColor || '#D4A017';

  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch(`/api/client/projects/${projectId}/files`);
      if (res.status === 401) {
        router.push('/client/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvoices() {
    try {
      setLoadingInvoices(true);
      const res = await fetch('/api/client/invoices');
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.invoices || []).filter((inv: any) => inv.project_id === projectId);
        setInvoices(filtered);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadFiles();
      loadInvoices();
    }
  }, [projectId]);

  const handleApproveFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to approve this deliverable? This will notify your freelancer.')) return;
    
    setApprovingId(fileId);
    try {
      const res = await fetch(`/api/client/approve/${fileId}`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Deliverable approved successfully! ✓');
        loadFiles();
      } else {
        alert('Failed to approve deliverable.');
      }
    } catch (err) {
      console.error('Approval failed:', err);
      alert('An error occurred during approval.');
    } finally {
      setApprovingId(null);
    }
  };

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <AlertCircle size={40} color="#EF4444" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Project Not Found</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>This project does not exist or you do not have permission to view it.</p>
        <Link href="/client/dashboard" style={{
          display: 'inline-block', marginTop: '16px', fontSize: '13px', fontWeight: 600, color: primaryColor, textDecoration: 'underline'
        }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const approvedCount = files.filter(f => f.is_approved).length;

  return (
    <div>
      {/* Back Button */}
      <Link href="/client/dashboard" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        textDecoration: 'none', color: 'var(--text-secondary)',
        fontSize: '13px', fontWeight: 600, marginBottom: '24px',
        transition: 'color 0.1s'
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      {/* Header Info */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px',
        borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
              {project.name}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
              {project.description || 'No description provided.'}
            </p>
          </div>
          
          {/* Status Display Card */}
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--border)',
            padding: '12px 18px', borderRadius: '12px', display: 'flex', gap: '20px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Files</span>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {files.length}
              </span>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Approved</span>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
                {approvedCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables Section */}
      <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px', letterSpacing: '-0.2px' }}>
        SHARED DELIVERABLES & DESIGN ASSETS
      </h2>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} className="animate-spin" color={primaryColor} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13.5px' }}>Loading project deliverables...</p>
        </div>
      ) : files.length === 0 ? (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)'
        }}>
          <FileText size={40} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: '#9CA3AF' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No Deliverables Shared Yet</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>Your freelancer has not uploaded any files to this project yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {files.map(file => (
            <div 
              key={file.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.01)',
                transition: 'border-color 0.12s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-dark, #CBD5E1)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* File Icon & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '8px',
                  background: file.is_approved ? '#ECFDF5' : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: file.is_approved ? '#10B981' : '#6B7280',
                  flexShrink: 0
                }}>
                  <PlatformIcon url={file.file_url} size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', wordBreak: 'break-all' }}>
                    {file.file_name}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)', alignItems: 'center', flexWrap: 'wrap' }}>
                    {(() => {
                      let typeTag = 'Other';
                      let version = 'v1';
                      try {
                        if (file.file_type && file.file_type.startsWith('{')) {
                          const parsed = JSON.parse(file.file_type);
                          typeTag = parsed.type || 'Other';
                          version = parsed.version || 'v1';
                        } else if (file.file_type) {
                          typeTag = file.file_type;
                        }
                      } catch (e) {
                        if (file.file_type) typeTag = file.file_type;
                      }

                      return (
                        <>
                          <span style={{
                            fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--border-light)',
                            borderRadius: '4px', padding: '1px 6px', fontWeight: 600
                          }}>
                            {typeTag}
                          </span>
                          <span>•</span>
                          <span style={{
                            fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--border-light)',
                            borderRadius: '4px', padding: '1px 6px', fontWeight: 600
                          }}>
                            {version}
                          </span>
                        </>
                      );
                    })()}
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={11} />
                      {new Date(file.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {/* Approval Status Badge */}
                {file.is_approved ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700
                  }}>
                    <CheckCircle2 size={13} />
                    <span>Approved</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700
                  }}>
                    <AlertCircle size={13} />
                    <span>Pending Review</span>
                  </div>
                )}

                {/* Actions: Download / Approve */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Open / Download */}
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title="View file"
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.12s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <ExternalLink size={14} />
                  </a>

                  {/* Approve Action */}
                  {!file.is_approved && (
                    <button
                      onClick={() => handleApproveFile(file.id)}
                      disabled={approvingId === file.id}
                      style={{
                        padding: '0 16px', height: '36px', borderRadius: '8px',
                        background: primaryColor, color: '#FFFFFF', border: 'none',
                        fontSize: '12.5px', fontWeight: 600, cursor: approvingId === file.id ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'opacity 0.12s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {approvingId === file.id ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Approving...
                        </>
                      ) : (
                        <>
                          <Award size={13} /> Approve Deliverable
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoices & Billing Section */}
      <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '40px 0 16px', letterSpacing: '-0.2px' }}>
        INVOICES & PROJECT BILLING
      </h2>

      {loadingInvoices ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={24} className="animate-spin" color={primaryColor} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px' }}>Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)'
        }}>
          <CreditCard size={32} strokeWidth={1.5} style={{ margin: '0 auto 12px', color: '#9CA3AF' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No Shared Invoices</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>There are no invoices linked to this project at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {invoices.map(invoice => {
            const isPaid = invoice.status === 'paid';
            return (
              <div 
                key={invoice.id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.01)'
                }}
              >
                {/* Invoice Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '8px',
                    background: isPaid ? '#ECFDF5' : '#FFFBEB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isPaid ? '#10B981' : '#D97706',
                    flexShrink: 0
                  }}>
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                      {invoice.invoice_number}
                    </h4>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      {invoice.due_date && (
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      <span>•</span>
                      <span>Issued: {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {/* Amount Breakdown */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{invoice.total_amount.toLocaleString('en-IN')}
                    </span>
                    <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '1px' }}>
                      Incl. GST (18%)
                    </span>
                  </div>

                  {/* Status Badge */}
                  {isPaid ? (
                    <div style={{
                      background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <CheckCircle2 size={12} /> Paid
                    </div>
                  ) : (
                    <div style={{
                      background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Clock size={12} /> Unpaid
                    </div>
                  )}

                  {/* Payment Button */}
                  {!isPaid && invoice.payment_link && (
                    <a 
                      href={invoice.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '0 16px', height: '36px', borderRadius: '8px',
                        background: '#1F2937', color: '#FFFFFF', textDecoration: 'none',
                        fontSize: '12px', fontWeight: 600, display: 'inline-flex',
                        alignItems: 'center', gap: '6px', transition: 'background-color 0.12s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#111827'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1F2937'}
                    >
                      Pay Securely <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClientProjectDetailPage() {
  return (
    <ClientLayout>
      <ProjectDetail />
    </ClientLayout>
  );
}
