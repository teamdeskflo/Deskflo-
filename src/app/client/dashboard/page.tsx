'use client';

import ClientLayout, { useClientPortal } from '@/components/layout/ClientLayout';
import Link from 'next/link';
import { FolderKanban, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

function ClientDashboard() {
  const { client, projects, branding } = useClientPortal();

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'on_hold');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const primaryColor = branding?.brandColor || '#D4A017';

  // Status Styling Config
  const STATUS_STYLES = {
    active:    { label: 'In Progress', bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    on_hold:   { label: 'On Hold',     bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
    completed: { label: 'Approved',    bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    cancelled: { label: 'Cancelled',   bg: '#FEF2F2', text: '#DC2626', border: '#FCA5A5' },
  };

  return (
    <div>
      {/* Dynamic Brand Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, #1E293B 100%)`,
        borderRadius: '16px',
        padding: '36px 40px',
        color: '#FFFFFF',
        marginBottom: '40px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative glass elements */}
        <div style={{
          position: 'absolute', right: '-50px', top: '-50px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', filter: 'blur(30px)'
        }} />

        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
          Workspace Dashboard
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
          View ongoing deliverables, approve finalized designs, and keep track of budget deadlines. All shared directly by <strong>{branding?.freelancerName}</strong>.
        </p>

        {/* Short Metrics */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Active Projects</span>
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{activeProjects.length}</span>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 600 }}>Approved Projects</span>
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, marginTop: '2px' }}>{completedProjects.length}</span>
          </div>
        </div>
      </div>

      {/* Projects Title */}
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 20px', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
        YOUR PROJECTS ({projects.length})
      </h2>

      {/* Projects List/Grid */}
      {projects.length === 0 ? (
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)'
        }}>
          <FolderKanban size={48} strokeWidth={1.5} style={{ margin: '0 auto 16px', color: '#9CA3AF' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>No Shared Projects Yet</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>Once {branding?.freelancerName} shares a project with you, it will show up here!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map(project => {
            const style = STATUS_STYLES[project.status] || STATUS_STYLES.active;
            return (
              <Link 
                key={project.id} 
                href={`/client/projects/${project.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                >
                  {/* Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                      background: style.bg, color: style.text, border: `1px solid ${style.border}`,
                      padding: '3px 8px', borderRadius: '12px'
                    }}>
                      {style.label}
                    </span>
                    {project.status === 'completed' ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : (
                      <Clock size={16} color="#9CA3AF" />
                    )}
                  </div>

                  {/* Name & Description */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.2px' }}>
                    {project.name}
                  </h3>
                  <p style={{
                    fontSize: '13px', color: 'var(--text-secondary)',
                    margin: '0 0 20px', lineHeight: 1.5, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                  }}>
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Divider & Metadata */}
                  <div style={{
                    borderTop: '1px solid var(--border-light)', paddingTop: '14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    {project.deadline ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Calendar size={13} />
                        <span style={{ fontSize: '12.5px' }}>
                          {new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No deadline</span>
                    )}

                    <span style={{
                      fontSize: '12.5px', fontWeight: 700, color: primaryColor,
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      Open Portal <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ClientLayout>
      <ClientDashboard />
    </ClientLayout>
  );
}
