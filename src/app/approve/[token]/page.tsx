'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  CheckCircle2, XCircle, AlertCircle, Lock, ExternalLink,
  FileText, Clock, Shield, ChevronDown, Loader2
} from 'lucide-react';

// ── Platform helpers (re-used from client portal) ──────────────────────────
function getPlatform(url: string): 'drive' | 'dropbox' | 'onedrive' | 'figma' | 'notion' | 'unknown' {
  if (!url) return 'unknown';
  const u = url.toLowerCase();
  if (u.includes('drive.google.com') || u.includes('docs.google.com') || u.includes('google.com/drive')) return 'drive';
  if (u.includes('dropbox.com')) return 'dropbox';
  if (u.includes('onedrive') || u.includes('sharepoint.com') || u.includes('1drv.ms') || u.includes('live.com')) return 'onedrive';
  if (u.includes('figma.com')) return 'figma';
  if (u.includes('notion.so') || u.includes('notion.site')) return 'notion';
  return 'unknown';
}

function PlatformIcon({ url, size = 28 }: { url: string; size?: number }) {
  const p = getPlatform(url);
  switch (p) {
    case 'drive':
      return (
        <svg viewBox="0 0 87.3 78" width={size} height={size}>
          <path fill="#0066da" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28 53.5H0a15.18 15.18 0 003.3 6.65z"/>
          <path fill="#00ac47" d="M43.65 25L29.35 0a15.18 15.18 0 00-3.3 3.3L.95 47.5A15.16 15.16 0 000 53.5h28z"/>
          <path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L87.3 53.5a15.16 15.16 0 000-6L59.3 25l-15.65 28.5L73.55 76.8z"/>
          <path fill="#00832d" d="M43.65 25l14.3-25A14.85 14.85 0 0051.3 0H36a14.85 14.85 0 00-6.65 0z"/>
          <path fill="#2684fc" d="M59.3 53.5H28L13.8 76.8c1.35.8 2.9 1.2 4.5 1.2h50.7a14.85 14.85 0 004.5-1.2z"/>
          <path fill="#ffba00" d="M73.4 26.5l-14.15-24.5a14.85 14.85 0 00-3.3-2L43.65 25 59.3 53.5h27.95A14.87 14.87 0 0087.3 50a15.16 15.16 0 00-.95-3.3z"/>
        </svg>
      );
    case 'dropbox':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#0061FE">
          <path d="M5.98 2L1 5.42l4.98 3.42 4.98-3.42L5.98 2zm12.04 0L13 5.42l5.02 3.42L23 5.42 18.02 2zM1 12.23l4.98 3.42 4.98-3.42L5.98 8.8 1 12.23zm17.02-3.43L13 12.23l5.02 3.42L23 12.23l-4.98-3.43zM12 12.63l-4.98-3.43 4.98-3.41 5.02 3.41-5.02 3.43zm-6.02 3.8v2.54l6.02 3.43 6.02-3.43v-2.54l-6.02 3.42-6.02-3.42z"/>
        </svg>
      );
    case 'onedrive':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="#0078D4">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z"/>
        </svg>
      );
    case 'figma':
      return (
        <svg viewBox="0 0 16 24" width={size} height={(size * 3) / 2}>
          <path d="M4 4c0-2.21 1.79-4 4-4h4v8H8C5.79 8 4 6.21 4 4z" fill="#F24E1E"/>
          <path d="M4 12c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4z" fill="#A259FF"/>
          <path d="M4 20c0-2.21 1.79-4 4-4s4 1.79 4 4v4H8c-2.21 0-4-1.79-4-4z" fill="#1ABC9C"/>
          <path d="M12 8c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4v8h4z" fill="#FF7262"/>
          <path d="M12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4h-4v8h4z" fill="#5551FF"/>
        </svg>
      );
    case 'notion':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3.5" fill="#000"/>
          <path d="M7 8V16M7 8L12.5 13.5V8M12.5 13.5L17 8V16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return <FileText size={size} color="#6B7280"/>;
  }
}

function platformLabel(url: string) {
  const p = getPlatform(url);
  const map: Record<string, string> = {
    drive: 'Google Drive', dropbox: 'Dropbox', onedrive: 'OneDrive',
    figma: 'Figma', notion: 'Notion', unknown: 'External Link'
  };
  return map[p] ?? 'External Link';
}

// ── Types ─────────────────────────────────────────────────────────────────
interface FileData {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  is_approved: boolean;
  approved_at?: string | null;
  project_id: string;
  projects?: {
    id: string;
    name: string;
    clients?: {
      id: string;
      name: string;
      company_name?: string | null;
      users?: {
        name?: string | null;
        company_name?: string | null;
        brand_color?: string | null;
        logo_url?: string | null;
      } | null;
    } | null;
  } | null;
}

type PageState = 'loading' | 'ready' | 'submitting' | 'approved' | 'rejected' | 'already_approved' | 'error';

// ── Meta parser ───────────────────────────────────────────────────────────
function parseMeta(raw: string | null): { type: string; version: string } {
  if (!raw) return { type: 'Other', version: 'v1' };
  try {
    if (raw.startsWith('{')) {
      const p = JSON.parse(raw);
      return { type: p.type || 'Other', version: p.version || 'v1' };
    }
  } catch {}
  return { type: raw, version: 'v1' };
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ApprovePage() {
  const { token } = useParams<{ token: string }>();

  const [state, setState] = useState<PageState>('loading');
  const [file, setFile] = useState<FileData | null>(null);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [approvedAt, setApprovedAt] = useState<string | null>(null);

  // ── Load file data ────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/approve/${token}`);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Link not found or expired.');
        setState('error');
        return;
      }
      const data = await res.json();
      const f: FileData = data.file;
      setFile(f);

      if (f.is_approved) {
        setApprovedAt(f.approved_at || null);
        setState('already_approved');
      } else {
        setState('ready');
        // Log "viewed" action
        fetch(`/api/approve/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'viewed' }),
        }).catch(() => {});
      }
    } catch {
      setError('Unable to load this approval link. Please try again.');
      setState('error');
    }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Submit approval / rejection ───────────────────────────────────────
  const submit = async (action: 'approved' | 'rejected') => {
    setState('submitting');
    try {
      const res = await fetch(`/api/approve/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment: comment.trim() || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      setApprovedAt(new Date().toISOString());
      setState(action === 'approved' ? 'approved' : 'rejected');
    } catch (e: unknown) {
      setError((e as Error).message || 'Something went wrong.');
      setState('error');
    }
  };

  // ── Brand color from freelancer ───────────────────────────────────────
  const brandColor = file?.projects?.clients?.users?.brand_color || '#D4A017';
  const freelancerName = file?.projects?.clients?.users?.name || 'Your Freelancer';
  const freelancerCompany = file?.projects?.clients?.users?.company_name || '';
  const clientName = file?.projects?.clients?.name || 'Client';
  const projectName = file?.projects?.name || 'Project';

  const meta = parseMeta(file?.file_type ?? null);

  // ── Helpers ────────────────────────────────────────────────────────────
  const fmtDate = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER STATES
  // ═══════════════════════════════════════════════════════════════════════

  if (state === 'loading') {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 30px' }}>
            <Loader2 size={32} color="#D4A017" style={{ animation: 'spin 0.8s linear infinite' }}/>
            <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>Loading approval request…</p>
          </div>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 30px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={26} color="#EF4444"/>
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Link Not Found</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>{error}</p>
          </div>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  if (state === 'approved') {
    return (
      <div style={pageWrap}>
        <div style={{ ...card, textAlign: 'center', padding: '56px 40px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', border: '1.5px solid #A7F3D0',
          }}>
            <CheckCircle2 size={34} color="#10B981"/>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Approved! ✓</h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
            You have approved <strong style={{ color: '#111827' }}>{file?.file_name}</strong>.<br/>
            This file is now locked and your freelancer has been notified.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#ECFDF5', border: '1px solid #A7F3D0',
            borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#065F46',
          }}>
            <Lock size={14} strokeWidth={2}/>
            Approved on {fmtDate(approvedAt)}
          </div>
          <p style={{ margin: '28px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
            You may safely close this window.
          </p>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div style={pageWrap}>
        <div style={{ ...card, textAlign: 'center', padding: '56px 40px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', border: '1.5px solid #FECACA',
          }}>
            <XCircle size={34} color="#EF4444"/>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Revision Requested</h1>
          <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.5 }}>
            Your feedback has been sent to <strong style={{ color: '#111827' }}>{freelancerName}</strong>.<br/>
            They will be in touch with an updated version soon.
          </p>
          <p style={{ margin: '28px 0 0', fontSize: '12px', color: '#9CA3AF' }}>
            You may safely close this window.
          </p>
        </div>
        <style>{keyframes}</style>
      </div>
    );
  }

  if (state === 'already_approved') {
    return (
      <div style={pageWrap}>
        <BrandHeader brandColor={brandColor} freelancerName={freelancerName} freelancerCompany={freelancerCompany}/>
        <div style={{ ...card, marginTop: '16px' }}>
          {/* File row */}
          <div style={fileRow}>
            <PlatformIcon url={file?.file_url ?? ''} size={36}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={fileName}>{file?.file_name}</span>
                <span style={badge('#065F46', '#ECFDF5', '#A7F3D0')}><Lock size={10} strokeWidth={2.5}/> Approved</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                <span style={metaBadge}>{platformLabel(file?.file_url ?? '')}</span>
                <span style={metaBadge}>{meta.type}</span>
                <span style={metaBadge}>{meta.version}</span>
                <span style={metaBadge}>{projectName}</span>
              </div>
            </div>
            <a href={file?.file_url} target="_blank" rel="noopener noreferrer" style={viewBtn(brandColor)}>
              View File <ExternalLink size={13}/>
            </a>
          </div>
          <div style={{ borderTop: '1px solid #F3F4F6', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={18} color="#10B981"/>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>Already approved</div>
              <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '1px' }}>
                Approved by {clientName} on {fmtDate(approvedAt)}
              </div>
            </div>
          </div>
        </div>
        <Footer/>
        <style>{keyframes}</style>
      </div>
    );
  }

  // ── Main "ready" state ────────────────────────────────────────────────
  return (
    <div style={pageWrap}>
      <BrandHeader brandColor={brandColor} freelancerName={freelancerName} freelancerCompany={freelancerCompany}/>

      {/* Main card */}
      <div style={{ ...card, marginTop: '16px' }}>
        
        {/* File preview row */}
        <div style={fileRow}>
          <PlatformIcon url={file?.file_url ?? ''} size={36}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={fileName}>{file?.file_name}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
              <span style={metaBadge}>{platformLabel(file?.file_url ?? '')}</span>
              <span style={metaBadge}>{meta.type}</span>
              <span style={metaBadge}>{meta.version}</span>
              <span style={metaBadge}>{projectName}</span>
            </div>
          </div>
          <a href={file?.file_url} target="_blank" rel="noopener noreferrer" style={viewBtn(brandColor)}>
            View File <ExternalLink size={13}/>
          </a>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#F3F4F6', margin: '0 28px' }}/>

        {/* Instruction block */}
        <div style={{ padding: '22px 28px 10px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            Review and confirm this deliverable
          </p>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#6B7280', lineHeight: 1.55 }}>
            {freelancerName ? `${freelancerName} has shared this file for your approval.` : 'Your freelancer has shared this file for your approval.'}
            {' '}Open the file above, review it carefully, then choose Approve or Request Revision below.
          </p>
        </div>

        {/* Optional comment toggle */}
        <div style={{ padding: '12px 28px' }}>
          <button
            onClick={() => setShowComment(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12.5px', color: '#6B7280', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500,
            }}
          >
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showComment ? 'rotate(180deg)' : 'rotate(0)' }}/>
            {showComment ? 'Hide comment' : 'Add a comment (optional)'}
          </button>
          {showComment && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Describe what you'd like changed, or leave a note for the freelancer…"
              rows={3}
              style={{
                display: 'block', width: '100%', marginTop: '10px',
                padding: '10px 14px', fontSize: '13.5px',
                border: '1.5px solid #E5E7EB', borderRadius: '8px',
                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                color: '#111827', background: '#FAFAFA', lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '14px 28px 28px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => submit('approved')}
            disabled={state === 'submitting'}
            style={{
              flex: 1, minWidth: '140px',
              padding: '13px 24px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}CC 100%)`,
              border: 'none', color: '#fff', fontSize: '14.5px',
              fontWeight: 700, cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: `0 4px 14px ${brandColor}44`, transition: 'opacity 0.15s',
              opacity: state === 'submitting' ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (state !== 'submitting') e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = state === 'submitting' ? '0.7' : '1'; }}
          >
            {state === 'submitting' ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }}/> : <CheckCircle2 size={16}/>}
            Approve & Lock
          </button>

          <button
            onClick={() => submit('rejected')}
            disabled={state === 'submitting'}
            style={{
              flex: 1, minWidth: '140px',
              padding: '13px 24px', borderRadius: '10px',
              background: '#FEF2F2', border: '1.5px solid #FECACA',
              color: '#DC2626', fontSize: '14.5px', fontWeight: 700,
              cursor: state === 'submitting' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (state !== 'submitting') e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
          >
            <XCircle size={16}/>
            Request Revision
          </button>
        </div>
      </div>

      {/* Trust info strip */}
      <div style={{
        marginTop: '16px', padding: '14px 20px',
        background: 'rgba(255,255,255,0.7)', borderRadius: '12px',
        border: '1px solid #F3F4F6', display: 'flex',
        alignItems: 'center', gap: '10px', backdropFilter: 'blur(4px)',
      }}>
        <Shield size={16} color="#6B7280" strokeWidth={1.8}/>
        <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF', lineHeight: 1.4 }}>
          Your approval is <strong style={{ color: '#6B7280' }}>timestamped and IP-logged</strong> for legal record-keeping. Once approved, the link will be locked and no changes can be made without your consent.
        </p>
      </div>

      {/* Deadline / timestamp strip */}
      <div style={{
        marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
        justifyContent: 'center',
      }}>
        <Clock size={13} color="#9CA3AF" strokeWidth={1.8}/>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
          You are reviewing this on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <Footer/>
      <style>{keyframes}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BrandHeader({ brandColor, freelancerName, freelancerCompany }: {
  brandColor: string; freelancerName: string; freelancerCompany: string;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB',
      padding: '20px 28px', display: 'flex', alignItems: 'center',
      gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Brand logo placeholder */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
        background: `linear-gradient(135deg, ${brandColor}22 0%, ${brandColor}44 100%)`,
        border: `1.5px solid ${brandColor}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 800, color: brandColor,
        letterSpacing: '-0.5px',
      }}>
        {freelancerName.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '1px' }}>
          {freelancerCompany || freelancerName}
        </div>
        <div style={{ fontSize: '12.5px', color: '#9CA3AF' }}>
          is requesting your approval for a file deliverable
        </div>
      </div>
      <div style={{
        fontSize: '11px', fontWeight: 600, color: brandColor,
        background: `${brandColor}18`, border: `1px solid ${brandColor}33`,
        borderRadius: '20px', padding: '4px 12px',
      }}>
        Approval Required
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ textAlign: 'center', marginTop: '28px', paddingBottom: '40px' }}>
      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
        Powered by{' '}
        <strong style={{ color: '#6B7280', fontWeight: 700 }}>Deskflo</strong>
        {' '}— Client Portal &amp; Approval Workflow
      </span>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────

const pageWrap: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #F5F6FA 0%, #EEF0F8 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px 16px',
  fontFamily: "'Inter', system-ui, sans-serif",
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  background: '#FFFFFF',
  borderRadius: '14px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
  overflow: 'hidden',
};

const fileRow: React.CSSProperties = {
  padding: '22px 28px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '14px',
};

const fileName: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#111827',
  lineHeight: 1.3,
  wordBreak: 'break-word',
};

const metaBadge: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#6B7280',
  background: '#F3F4F6',
  borderRadius: '4px',
  padding: '2px 7px',
  letterSpacing: '0.2px',
};

function badge(color: string, bg: string, border: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', fontWeight: 700, color, background: bg,
    border: `1px solid ${border}`, borderRadius: '20px', padding: '2px 8px',
  };
}

function viewBtn(brandColor: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '8px 14px', borderRadius: '8px',
    background: `${brandColor}15`, border: `1.5px solid ${brandColor}44`,
    color: brandColor, fontSize: '13px', fontWeight: 600,
    textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'background 0.15s',
  };
}

const keyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;
