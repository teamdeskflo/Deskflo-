'use client';

import { useState, useRef } from 'react';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  FolderOpen, BarChart2, ChevronDown, Link as LinkIcon,
  Clock, CheckCircle2, AlertCircle, Upload, Check, FileText
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type FileStatus = 'pending' | 'approved';

type FileItem = {
  id: number;
  fileName: string;
  project: string;
  status: FileStatus;
  url: string;
};

// ── Mock data ──
const INITIAL_FILES: FileItem[] = [
  { id: 1, fileName: 'logo_final.png',    project: 'Website Redesign', status: 'pending',  url: 'deskflo.in/f/logofnl' },
  { id: 2, fileName: 'homepage_v2.pdf',   project: 'Website Redesign', status: 'approved', url: 'deskflo.in/f/hpv2' },
  { id: 3, fileName: 'brand_guide.pdf',   project: 'Brand Guide',      status: 'pending',  url: 'deskflo.in/f/bguide' },
  { id: 4, fileName: 'social_pack.zip',   project: 'Social Media Kit', status: 'pending',  url: 'deskflo.in/f/socpack' },
  { id: 5, fileName: 'seo_report.pdf',    project: 'SEO Audit',        status: 'approved', url: 'deskflo.in/f/seorep' },
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fileName: file?.fileName || '',
    project: file?.project || '',
    status: file?.status || 'pending',
    url: file?.url || '', // Empty initially unless editing
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFormData(prev => ({
        ...prev,
        fileName: selectedFile.name,
        // Mock a URL generation for the uploaded file
        url: `deskflo.in/f/${Math.random().toString(36).substring(7)}`
      }));
    }
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
          padding: '28px', width: '100%', maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          {file ? 'Edit File Details' : 'Upload New File'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* File Upload Area */}
          {!file && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Select File
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                  padding: '20px', textAlign: 'center', cursor: 'pointer',
                  background: 'var(--content-bg)', transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-muted)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  style={{ display: 'none' }} 
                />
                <Upload size={20} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Click to browse from your device
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Or paste an external link below
                </p>
              </div>
            </div>
          )}

          {/* File Name (Auto-filled but editable) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              File Name
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

          {/* External Link */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              External Link (Optional)
            </label>
            <input
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. drive.google.com/..."
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Project Name */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Project Name
            </label>
            <input
              value={formData.project}
              onChange={e => setFormData({ ...formData, project: e.target.value })}
              placeholder="e.g. Website Redesign"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as FileStatus })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.fileName || !formData.project) return alert('File name and project are required');
              
              // Ensure we always have a URL to copy
              const finalData = { ...formData };
              if (!finalData.url) {
                 finalData.url = `deskflo.in/f/${Math.random().toString(36).substring(7)}`;
              }
              
              onSave(finalData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >{file ? 'Save Changes' : 'Upload File'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function FilesPage() {
  const user = useUser();
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingFile, setEditingFile] = useState<FileItem | undefined>();

  const filtered = files.filter(f => {
    const matchSearch =
      f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      f.project.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : f.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPending = files.filter(f => f.status === 'pending').length;
  const totalApproved = files.filter(f => f.status === 'approved').length;
  const thisMonth = 8; // Mock stat

  const handleSaveFile = (data: Partial<FileItem>) => {
    if (modal === 'edit' && editingFile) {
      setFiles(files.map(f => f.id === editingFile.id ? { ...f, ...data } as FileItem : f));
    } else {
      setFiles([{ ...data, id: Date.now() } as FileItem, ...files]);
    }
    setModal(null);
    setEditingFile(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(f => f.id !== id));
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
          Welcome back, {user.name.split(' ')[0]}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </p>
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
          Upload File
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
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
          padding: '10px 20px', background: 'var(--content-bg)',
          borderBottom: '1px solid var(--border)', gap: '10px'
        }}>
          {['File Name', 'Project', 'Status', 'Link', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Actions' ? 'right' : 'left' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No files found.
          </div>
        ) : (
          filtered.map((file, i) => {
            const statusCfg = STATUS_CONFIG[file.status];
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={file.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
                  padding: '14px 20px', alignItems: 'center', gap: '10px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* File Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} strokeWidth={2} color="var(--text-muted)" />
                  <p style={{ fontWeight: 600, fontSize: '13.5px', margin: 0, color: 'var(--text-primary)' }}>
                    {file.fileName}
                  </p>
                </div>

                {/* Project */}
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {file.project}
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

                {/* Link */}
                <div>
                  <CopyButton textToCopy={file.url} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <button
                    title="Edit file details"
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
                  <button
                    title="Delete file"
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
          Showing {filtered.length} of {files.length} files
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
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          This month: <strong>{thisMonth}</strong>
        </span>
      </div>
    </div>
  );
}
