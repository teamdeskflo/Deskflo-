'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  FolderOpen, BarChart2, ChevronDown, Link as LinkIcon,
  Clock, CheckCircle2, AlertCircle, Upload, Check, FileText, Lock
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Domain Validation & Icon Utilities ─────────────────
const ALLOWED_DOMAINS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'www.dropbox.com',
  'onedrive.live.com',
  'sharepoint.com',
  '1drv.ms',
  'live.com',
  'figma.com',
  'www.figma.com',
  'notion.so',
  'www.notion.so',
  'notion.site',
  'www.notion.site'
];

function validateHostingUrl(urlStr: string): boolean {
  try {
    let testUrl = urlStr.trim();
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }
    const parsed = new URL(testUrl);
    const hostname = parsed.hostname.toLowerCase();
    
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
}

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

function PlatformIcon({ url, size = 16 }: { url: string; size?: number }) {
  const platform = getPlatformFromUrl(url);
  const iconStyle = { flexShrink: 0 };
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
      return <LinkIcon size={size} color="var(--text-muted)" style={iconStyle} />;
  }
}

// ── Types ─────────────────────────────────────────
type FileStatus = 'pending' | 'approved';

type FileItem = {
  id: string;
  fileName: string;
  projectId: string;
  project: string;
  status: FileStatus;
  url: string;
  copyUrl: string;
  typeTag: string;
  version: string;
};

const STATUS_CONFIG: Record<FileStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending:  { label: 'Pending',  icon: Clock,        color: '#D4A017', bg: '#FDF8EC' },
  approved: { label: 'Approved', icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
};

// ── Copy Button Component ───────────────────────────────
function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
        background: 'var(--content-bg)', border: '1px solid var(--border)',
        fontSize: '12px', fontWeight: 600, color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => !copied && (e.currentTarget.style.borderColor = 'var(--text-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => !copied && (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <LinkIcon size={13} strokeWidth={2} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ── Upload / Edit Modal ───────────────────────────────
function FileModal({ file, onClose, onSave }: { file?: FileItem; onClose: () => void; onSave: (f: Partial<FileItem>) => void }) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [urlError, setUrlError] = useState('');
  
  const [formData, setFormData] = useState({
    fileName: file?.fileName || '',
    project_id: file?.projectId || '',
    status: file?.status || 'pending',
    url: file?.url || '',
    typeTag: file?.typeTag || 'Other',
    version: file?.version || 'v1',
  });

  // Load projects list for dropdown selection
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data.map(p => ({ id: p.id, name: p.name })));
          if (data.length > 0 && !formData.project_id) {
            setFormData(prev => ({ ...prev, project_id: data[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading projects in modal:', err);
      }
    }
    loadProjects();
  }, [formData.project_id]);

  const handleUrlChange = (val: string) => {
    setFormData(prev => ({ ...prev, url: val }));
    if (val && !validateHostingUrl(val)) {
      setUrlError('URL must be from a supported platform: Google Drive, Dropbox, OneDrive, Figma, or Notion.');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = () => {
    if (!formData.fileName || !formData.project_id || !formData.url) {
      alert('All fields are required.');
      return;
    }
    if (!validateHostingUrl(formData.url)) {
      alert('Invalid URL. Only links from Google Drive, Dropbox, OneDrive, Figma, and Notion are accepted.');
      return;
    }
    onSave({
      id: file?.id,
      fileName: formData.fileName,
      projectId: formData.project_id,
      url: formData.url,
      typeTag: formData.typeTag,
      version: formData.version,
    });
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
          padding: '28px', width: '100%', maxWidth: '460px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
          {file ? 'Edit Link Details' : 'Add Shared Link'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Warning banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px',
            color: '#B45309', lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Ensure your link is set to <strong>"Anyone with link can view"</strong> so your client can access it.</span>
          </div>

          {/* External Link */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              File URL / Storage Link
            </label>
            <input
              value={formData.url}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="e.g. drive.google.com/..."
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
            {urlError && (
              <p style={{ margin: '5px 0 0', fontSize: '11px', color: 'var(--error)' }}>
                {urlError}
              </p>
            )}
          </div>

          {/* File Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              File Name / Label
            </label>
            <input
              value={formData.fileName}
              onChange={e => setFormData({ ...formData, fileName: e.target.value })}
              placeholder="e.g. logo_final.png"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* File Type Tag Selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              File Type Tag
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Design', 'Document', 'Video', 'Invoice', 'Other'].map(tag => {
                const isSelected = formData.typeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFormData({ ...formData, typeTag: tag })}
                    style={{
                      padding: '6px 14px', borderRadius: '20px',
                      border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--text-primary)' : 'var(--card-bg)',
                      color: isSelected ? 'var(--card-bg)' : 'var(--text-secondary)',
                      fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid row for Version and Project selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Version */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Version
              </label>
              <select
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                  cursor: 'pointer'
                }}
              >
                {['v1', 'v2', 'v3', 'v4', 'v5'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Project Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Project
              </label>
              <select
                value={formData.project_id}
                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                  cursor: 'pointer'
                }}
              >
                {projects.length === 0 ? (
                  <option value="">No projects found</option>
                ) : (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={handleSubmit}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}
          >{file ? 'Save Details' : 'Add Link'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function FilesPage() {
  const user = useUser();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingFile, setEditingFile] = useState<FileItem | undefined>();

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // ── Fetch Files ───────────────────────────────────────────
  async function loadFiles() {
    try {
      setLoading(true);
      const res = await fetch('/api/files');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((f: any) => {
          const sharedSlug = f.shared_links?.[0]?.slug || '';
          const copyUrl = sharedSlug 
            ? `${window.location.origin}/approve/${sharedSlug}`
            : f.file_url;

          let typeTag = 'Other';
          let version = 'v1';
          try {
            if (f.file_type && f.file_type.startsWith('{')) {
              const parsed = JSON.parse(f.file_type);
              typeTag = parsed.type || 'Other';
              version = parsed.version || 'v1';
            } else if (f.file_type) {
              typeTag = f.file_type;
            }
          } catch (e) {
            if (f.file_type) typeTag = f.file_type;
          }

          return {
            id: f.id,
            fileName: f.file_name,
            projectId: f.project_id,
            project: f.projects?.name || 'Project',
            status: (f.is_approved ? 'approved' : 'pending') as FileStatus,
            url: f.file_url,
            copyUrl: copyUrl,
            typeTag,
            version
          };
        });
        setFiles(formatted);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  const filtered = files.filter(f => {
    const matchSearch =
      f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      f.project.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : f.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPending = files.filter(f => f.status === 'pending').length;
  const totalApproved = files.filter(f => f.status === 'approved').length;

  // ── Save/Upload File ──────────────────────────────────────
  const handleSaveFile = async (data: Partial<FileItem>) => {
    try {
      const typeStr = JSON.stringify({ type: data.typeTag, version: data.version });
      const payload = {
        project_id: data.projectId || (data as any).project_id,
        file_name: data.fileName,
        file_url: data.url,
        file_type: typeStr
      };

      let res;
      if (data.id) {
        res = await fetch(`/api/files/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        loadFiles();
      } else {
        const errData = await res.json();
        alert('Failed to save link: ' + (errData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving file:', err);
    }
    setModal(null);
    setEditingFile(undefined);
  };

  // ── Delete File ───────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shared link deliverable?')) {
      try {
        const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadFiles();
        } else {
          const errData = await res.json();
          alert('Failed to delete file: ' + (errData.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {modal && (
        <FileModal
          file={modal === 'edit' ? editingFile : undefined}
          onClose={() => { setModal(null); setEditingFile(undefined); }}
          onSave={handleSaveFile}
        />
      )}

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
          Files
        </h1>
        <button
          onClick={() => setModal('add')}
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
          <Plus size={15} strokeWidth={2.5} />
          Add Shared Link
        </button>
      </div>

      {/* Main card */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '16px', overflow: 'hidden',
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
              placeholder="Search files..."
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
              <SlidersHorizontal size={14} strokeWidth={1.8} />
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
                {(['all', 'pending', 'approved'] as const).map(f => (
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
                    {f === 'all' ? 'All Files' : f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr auto',
          padding: '10px 20px', background: 'var(--content-bg)',
          borderBottom: '1px solid var(--border)', gap: '10px'
        }}>
          {['File Link', 'Project', 'Status', 'Client URL', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Actions' ? 'right' : 'left' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows / Blank Slate */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Loading your files...
          </div>
        ) : files.length === 0 ? (
          /* Premium Blank Slate Empty State Illustration */
          <div style={{
            padding: '60px 30px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px', color: 'var(--text-muted)'
            }}>
              <LinkIcon size={24} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
              Your shared file links will be listed here
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '380px', lineHeight: 1.5 }}>
              Securely share Google Drive, Dropbox, OneDrive, Figma designs, or Notion pages. Track revisions with versions and get easy client approvals.
            </p>
            <button
              onClick={() => setModal('add')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'var(--text-primary)', color: 'var(--card-bg)',
                border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Plus size={14} strokeWidth={2.5} /> Add First Link
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No deliverables found matching status filter.
          </div>
        ) : (
          filtered.map((file, i) => {
            const statusCfg = STATUS_CONFIG[file.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            const isApproved = file.status === 'approved';

            return (
              <div
                key={file.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr auto',
                  padding: '14px 20px', alignItems: 'center', gap: '10px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* File Link details (Icon + Label + Type/Version Badges) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlatformIcon url={file.url} size={18} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {file.fileName}
                    </a>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--border-light)',
                        borderRadius: '4px', padding: '1px 6px', fontWeight: 600, letterSpacing: '0.2px'
                      }}>
                        {file.typeTag}
                      </span>
                      <span style={{
                        fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--border-light)',
                        borderRadius: '4px', padding: '1px 6px', fontWeight: 600, letterSpacing: '0.2px'
                      }}>
                        {file.version}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {file.project}
                </div>

                {/* Status Badge */}
                <div>
                  {isApproved ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0',
                      fontSize: '11px', fontWeight: 700,
                    }}>
                      <Lock size={12} strokeWidth={2.5} />
                      Approved (Locked)
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      background: statusCfg.bg, color: statusCfg.color,
                      fontSize: '11px', fontWeight: 600,
                    }}>
                      <StatusIcon size={12} strokeWidth={2.5} />
                      {statusCfg.label}
                    </span>
                  )}
                </div>

                {/* Copy client link */}
                <div>
                  <CopyButton textToCopy={file.copyUrl} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {isApproved ? (
                    <>
                      {/* Locked view */}
                      <button
                        disabled
                        title="Approved files are locked and cannot be edited"
                        style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', background: 'var(--content-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5
                        }}
                      >
                        <Lock size={13} strokeWidth={1.8} />
                      </button>
                      <button
                        disabled
                        title="Approved files are locked and cannot be deleted"
                        style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', background: 'var(--content-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-muted)', cursor: 'not-allowed', opacity: 0.5
                        }}
                      >
                        <Trash2 size={13} strokeWidth={1.8} style={{ opacity: 0.5 }} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Edit details */}
                      <button
                        title="Edit link details"
                        onClick={() => { setEditingFile(file); setModal('edit'); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)', background: 'var(--card-bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <Pencil size={13} strokeWidth={1.8} />
                      </button>
                      {/* Delete */}
                      <button
                        title="Delete link"
                        onClick={() => handleDelete(file.id)}
                        style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                          border: '1px solid #FECACA', background: '#FEF2F2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: 'var(--error)', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                      </button>
                    </>
                  )}
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
          Showing {filtered.length} of {files.length} links
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: '8px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <BarChart2 size={16} strokeWidth={1.8} color="var(--text-muted)" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>File Stats</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Total: <strong>{files.length}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Pending: <strong>{totalPending}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Approved: <strong>{totalApproved}</strong>
        </span>
      </div>
    </div>
  );
}
