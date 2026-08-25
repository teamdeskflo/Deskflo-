'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Briefcase, Sparkles, Loader2 } from 'lucide-react';

type Branding = {
  freelancerName: string;
  logoUrl: string | null;
  brandColor: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  company_name?: string;
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';
  budget?: number;
  deadline?: string;
};

type ClientPortalContextType = {
  client: Client | null;
  projects: Project[];
  branding: Branding | null;
  loading: boolean;
  refreshData: () => Promise<void>;
};

const ClientPortalContext = createContext<ClientPortalContextType | undefined>(undefined);

export function useClientPortal() {
  const context = useContext(ClientPortalContext);
  if (!context) throw new Error('useClientPortal must be used within a ClientPortalProvider');
  return context;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadData() {
    try {
      const res = await fetch('/api/client/projects');
      if (res.status === 401) {
        // Clear cookie & redirect
        document.cookie = 'client_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/client/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load portal details');
      
      const data = await res.json();
      setClient(data.client);
      setProjects(data.projects || []);
      setBranding(data.branding);
    } catch (err) {
      console.error('Portal load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    document.cookie = 'client_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/client/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0F172A', color: '#F8FAFC', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="#3B82F6" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>Loading Client Portal...</p>
        </div>
      </div>
    );
  }

  const primaryColor = branding?.brandColor || '#D4A017';

  return (
    <ClientPortalContext.Provider value={{ client, projects, branding, loading, refreshData: loadData }}>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--content-bg, #FAFAFA)',
        color: 'var(--text-primary, #1F2937)',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* White-labeled Navbar */}
        <header style={{
          background: 'var(--card-bg, #FFFFFF)',
          borderBottom: '1px solid var(--border, #E5E7EB)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Brand/Logo Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt={branding.freelancerName} 
                style={{ height: '36px', width: 'auto', objectFit: 'contain', borderRadius: '6px' }} 
              />
            ) : (
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: `linear-gradient(135deg, ${primaryColor} 0%, #111827 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF'
              }}>
                <Briefcase size={18} />
              </div>
            )}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #6B7280)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '1px' }}>
                CLIENT PORTAL
              </span>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #111827)' }}>
                {branding?.freelancerName}
              </span>
            </div>
          </div>

          {/* User/Logout actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {client && (
              <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6B7280)' }}>
                Welcome, <strong>{client.company_name || client.name}</strong>
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border, #E5E7EB)',
                background: 'transparent', color: 'var(--text-secondary, #6B7280)',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.12s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#EF4444';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border, #E5E7EB)';
                e.currentTarget.style.color = 'var(--text-secondary, #6B7280)';
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>

        {/* Footer branding */}
        <footer style={{
          padding: '24px', borderTop: '1px solid var(--border, #E5E7EB)',
          background: 'var(--card-bg, #FFFFFF)', textAlign: 'center',
          marginTop: '40px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF' }}>
            <Sparkles size={12} color={primaryColor} />
            <span>Powered by <strong style={{ color: '#4B5563' }}>Deskflo</strong></span>
          </div>
        </footer>
      </div>
    </ClientPortalContext.Provider>
  );
}
