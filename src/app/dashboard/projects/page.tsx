'use client';

import { useState } from 'react';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  FolderOpen, BarChart2, ChevronDown, ChevronUp,
  Clock, CheckCircle2, AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────
type ProjectStatus = 'review' | 'approved' | 'progress' | 'pending';

type Project = {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  deadline: string;
  budget: string; // Storing as raw number string
  filesShared: number;
  unpaidInvoices: number;
  description: string;
};

// ── Mock data ──
const INITIAL_PROJECTS: Project[] = [
  { id: 1, name: 'Website Redesign',   client: 'Rahul Sharma',   status: 'review',   deadline: '20 May', budget: '45000', filesShared: 12, unpaidInvoices: 1, description: 'Complete overhaul of the main e-commerce website including new checkout flow and product pages.' },
  { id: 2, name: 'Logo Package',       client: 'Priya Patel',    status: 'approved', deadline: '15 May', budget: '12000', filesShared: 4,  unpaidInvoices: 0, description: 'Brand identity design including logo variations, color palette, and typography guidelines.' },
  { id: 3, name: 'Social Media Kit',   client: 'Vikram Singh',   status: 'progress', deadline: '30 May', budget: '18500', filesShared: 8,  unpaidInvoices: 0, description: 'Templates for Instagram and LinkedIn posts, plus cover photos for all platforms.' },
  { id: 4, name: 'SEO Audit',          client: 'ClientX Agency', status: 'pending',  deadline: '10 Jun', budget: '25000', filesShared: 0,  unpaidInvoices: 0, description: 'Comprehensive technical SEO audit and keyword strategy report for Q3.' },
  { id: 5, name: 'Brand Guidelines',   client: 'Rahul Sharma',   status: 'progress', deadline: '25 May', budget: '15000', filesShared: 2,  unpaidInvoices: 1, description: 'A 20-page PDF document detailing the proper usage of the new WebCraft branding.' },
];

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: any; color: string; bg: string }> = {
  review:   { label: 'Review',   icon: AlertCircle, color: '#D4A017', bg: '#FDF8EC' },
  approved: { label: 'Approved', icon: CheckCircle2,color: '#10B981', bg: '#ECFDF5' },
  progress: { label: 'Progress', icon: RefreshCw,   color: '#3B82F6', bg: '#EFF6FF' },
  pending:  { label: 'Pending',  icon: Clock,       color: 'var(--text-muted)', bg: '#F3F4F6' },
};

// Formatting helper (Can be replaced with user preference later)
const formatCurrency = (amount: string) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// ── Add / Edit Modal ───────────────────────────────
function ProjectModal({ project, onClose, onSave }: { project?: Project; onClose: () => void; onSave: (p: Partial<Project>) => void }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    client: project?.client || '',
    status: project?.status || 'progress',
    deadline: project?.deadline || '',
    budget: project?.budget || '',
    description: project?.description || '',
  });

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
          padding: '28px', width: '100%', maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          {project ? 'Edit Project' : 'Create Project'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* General Text Inputs */}
          {[
            { label: 'Project Name', field: 'name', placeholder: 'e.g. Website Redesign', type: 'text' },
            { label: 'Client Name', field: 'client', placeholder: 'e.g. Rahul Sharma', type: 'text' },
            { label: 'Deadline', field: 'deadline', placeholder: 'e.g. 20 May', type: 'text' },
          ].map(({ label, field, placeholder, type }) => (
            <div key={label}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {label}
              </label>
              <input
                type={type}
                value={(formData as any)[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                }}
              />
            </div>
          ))}

          {/* Budget Input */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Budget
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>₹</span>
              <input
                type="number"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
                placeholder="45000"
                style={{
                  width: '100%', padding: '9px 12px 9px 24px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                }}
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="pending">Pending</option>
              <option value="progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Project Scope / Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project scope..."
              rows={3}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                resize: 'none', fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.name || !formData.client) return alert('Project name and client are required');
              onSave(formData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--text-primary)', color: 'var(--card-bg)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >{project ? 'Save Changes' : 'Create Project'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function ProjectsPage() {
  const user = useUser();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'progress' | 'review' | 'pending' | 'approved'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = projects.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : p.status === filter;
    return matchSearch && matchFilter;
  });

  const totalActive = projects.filter(p => p.status === 'progress' || p.status === 'review').length;
  const totalCompleted = projects.filter(p => p.status === 'approved').length;
  const totalOverdue = 2; // Mock stat for the bottom bar

  const handleSaveProject = (data: Partial<Project>) => {
    if (modal === 'edit' && editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data } as Project : p));
    } else {
      setProjects([...projects, { 
        ...data, 
        id: Date.now(), 
        filesShared: 0, 
        unpaidInvoices: 0 
      } as Project]);
    }
    setModal(null);
    setEditingProject(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      setExpandedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {modal && (
        <ProjectModal
          project={modal === 'edit' ? editingProject : undefined}
          onClose={() => { setModal(null); setEditingProject(undefined); }}
          onSave={handleSaveProject}
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
          Projects
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
          Create Project
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
              placeholder="Search projects..."
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
              Filter
              <ChevronDown size={13} strokeWidth={2} />
            </button>
            {showFilterMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '42px', zIndex: 10,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                minWidth: '140px', overflow: 'hidden',
              }}>
                {(['all', 'progress', 'review', 'pending', 'approved'] as const).map(f => (
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
                    {f === 'all' ? 'All Statuses' : f}
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
          {['Project Name', 'Client', 'Status', 'Deadline', 'Actions'].map(h => (
            <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', textAlign: h === 'Actions' ? 'right' : 'left' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No projects found.
          </div>
        ) : (
          filtered.map((proj, i) => {
            const isExpanded = expandedIds.has(proj.id);
            const statusCfg = STATUS_CONFIG[proj.status];
            const StatusIcon = statusCfg.icon;

            return (
              <div key={proj.id} style={{ borderBottom: i < filtered.length - 1 || isExpanded ? '1px solid var(--border-light)' : 'none' }}>
                
                {/* Main Row */}
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
                    padding: '14px 20px', alignItems: 'center', gap: '10px',
                    background: isExpanded ? 'var(--content-bg)' : 'var(--card-bg)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'var(--content-bg)')}
                  onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Name & Details Toggle */}
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13.5px', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      {proj.name}
                    </p>
                    <button
                      onClick={() => toggleExpand(proj.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'transparent', border: 'none', padding: 0,
                        color: isExpanded ? 'var(--text-primary)' : 'var(--accent-dark)',
                        fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                        transition: 'color 0.15s',
                      }}
                    >
                      {isExpanded ? (
                        <><ChevronUp size={12} strokeWidth={2.5} /> Close Details</>
                      ) : (
                        <><ChevronDown size={12} strokeWidth={2.5} /> View Details</>
                      )}
                    </button>
                  </div>

                  {/* Client */}
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {proj.client}
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

                  {/* Deadline */}
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {proj.deadline}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <button
                      title="Edit project"
                      onClick={() => { setEditingProject(proj); setModal('edit'); }}
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
                      title="Delete project"
                      onClick={() => handleDelete(proj.id)}
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
                    <Link
                      href={`/dashboard/files?project=${proj.id}`}
                      title="View files"
                      style={{
                        width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)', background: 'var(--card-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-dark)'; e.currentTarget.style.color = 'var(--accent-dark)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <FolderOpen size={13} strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>

                {/* Accordion Details Panel */}
                <div style={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'var(--content-bg)',
                  borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div style={{ padding: '20px', display: 'flex', gap: '32px' }}>
                    {/* Description */}
                    <div style={{ flex: '2', borderRight: '1px solid var(--border-light)', paddingRight: '24px' }}>
                      <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.5px' }}>
                        Project Scope
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                        {proj.description}
                      </p>
                    </div>

                    {/* KPIs */}
                    <div style={{ flex: '1.5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px' }}>Budget</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {formatCurrency(proj.budget)}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px' }}>Files Shared</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="var(--accent-dark)" />
                          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{proj.filesShared}</p>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px' }}>Unpaid Invoices</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: proj.unpaidInvoices > 0 ? 'var(--error)' : 'var(--success)', margin: 0 }}>
                          {proj.unpaidInvoices}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })
        )}

        {/* Count */}
        <div style={{
          padding: '12px 20px',
          fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center',
        }}>
          Showing {filtered.length} of {projects.length} projects
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
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>Quick Stats</span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Total: <strong>{projects.length}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Active: <strong>{totalActive}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
          Completed: <strong>{totalCompleted}</strong>
        </span>
        <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
        <span style={{ fontSize: '13.5px', color: 'var(--error)', fontWeight: 700 }}>
          Overdue: {totalOverdue}
        </span>
      </div>
    </div>
  );
}
