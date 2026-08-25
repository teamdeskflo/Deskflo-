'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, LayoutDashboard, Users, CheckSquare, Receipt,
  ListPlus, HeadphonesIcon, FileText, Settings, ShieldCheck,
  LogOut, Menu, X, Loader2, Bell, User
} from 'lucide-react';
import { ADMIN_NAV, ROLE_LABELS, ROLE_COLORS, hasPermission, type AdminRole } from '@/lib/admin/rbac';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

// Icon mapper for lucide-react dynamic loading
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  Users,
  CheckSquare,
  Receipt,
  ListPlus,
  HeadphonesIcon,
  FileText,
  Settings,
  ShieldCheck,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inactivity timeout timer (30 min)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
  }, [router]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log('Inactivity timeout reached. Logging out...');
      handleLogout();
    }, INACTIVITY_TIME);
  }, [handleLogout]);

  useEffect(() => {
    // Add event listeners for activity tracking
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(e => window.addEventListener(e, resetTimeout));

    resetTimeout();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimeout]);

  // Load current admin session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        setAdmin(data.admin);
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  if (loading) {
    return (
      <div style={loaderWrap}>
        <Loader2 size={36} color="#C9940F" style={{ animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '14px', color: '#9E9B94', marginTop: '12px' }}>Verifying admin credentials...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!admin) return null;

  const roleLabel = ROLE_LABELS[admin.role] || admin.role;
  const roleColor = ROLE_COLORS[admin.role] || { bg: '#232220', color: '#9E9B94' };

  return (
    <div style={layoutWrap}>
      {/* ── Sidebar (Desktop) ────────────────────────────────────────────── */}
      <aside style={sidebar}>
        <div style={sidebarHeader}>
          <div style={logoWrapper}>
            <Shield size={20} color="#C9940F" />
          </div>
          <span style={logoText}>Deskflo Admin</span>
        </div>

        <div style={adminProfile}>
          <div style={profileAvatar}>{admin.name.charAt(0).toUpperCase()}</div>
          <div style={profileInfo}>
            <div style={profileName}>{admin.name}</div>
            <span style={{ ...roleBadge, background: roleColor.bg, color: roleColor.color }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <nav style={nav}>
          {ADMIN_NAV.map(item => {
            if (!hasPermission(admin.role, item.permission)) return null;
            const Icon = ICON_MAP[item.icon] || Shield;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...navItem,
                  background: isActive ? '#272622' : 'transparent',
                  color: isActive ? '#DEDAD5' : '#9E9B94',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={sidebarFooter}>
          <button onClick={handleLogout} style={logoutBtn}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Topnav ────────────────────────────────────────────────── */}
      <header style={mobileHeader}>
        <button onClick={() => setMobileMenuOpen(true)} style={menuToggle}>
          <Menu size={20} color="#DEDAD5" />
        </button>
        <span style={logoText}>Deskflo Admin</span>
        <div style={profileAvatarSmall}>{admin.name.charAt(0).toUpperCase()}</div>
      </header>

      {/* ── Mobile Menu Overlay ──────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div style={overlay}>
          <div style={overlayContent}>
            <div style={overlayHeader}>
              <span style={logoText}>Deskflo Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} style={menuToggle}>
                <X size={20} color="#DEDAD5" />
              </button>
            </div>

            <div style={adminProfileMobile}>
              <div style={profileAvatar}>{admin.name.charAt(0).toUpperCase()}</div>
              <div style={{ marginLeft: '12px' }}>
                <div style={profileName}>{admin.name}</div>
                <span style={{ ...roleBadge, background: roleColor.bg, color: roleColor.color }}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <nav style={navMobile}>
              {ADMIN_NAV.map(item => {
                if (!hasPermission(admin.role, item.permission)) return null;
                const Icon = ICON_MAP[item.icon] || Shield;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      ...navItemMobile,
                      background: isActive ? '#272622' : 'transparent',
                      color: isActive ? '#DEDAD5' : '#9E9B94',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button onClick={handleLogout} style={logoutBtnMobile}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Main Canvas ──────────────────────────────────────────────────── */}
      <main style={mainContent}>
        <div style={contentInner}>{children}</div>
      </main>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const loaderWrap: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0E0E0D',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
};

const layoutWrap: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  background: '#0E0E0D',
  color: '#DEDAD5',
  fontFamily: "'Inter', sans-serif",
};

const sidebar: React.CSSProperties = {
  width: '240px',
  background: '#141413',
  borderRight: '1px solid #2E2C29',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  zIndex: 40,
  // Hide on mobile (controlled by CSS custom classes or custom media query simulation)
  '@media (max-width: 767px)': {
    display: 'none',
  },
} as any;

const sidebarHeader: React.CSSProperties = {
  padding: '24px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: '1px solid #232220',
};

const logoWrapper: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: 'rgba(201, 148, 15, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoText: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  letterSpacing: '-0.3px',
  color: '#DEDAD5',
};

const adminProfile: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderBottom: '1px solid #232220',
};

const profileAvatar: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: '#C9940F',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '14px',
};

const profileInfo: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
};

const profileName: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const roleBadge: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '20px',
  alignSelf: 'flex-start',
  textTransform: 'uppercase',
  letterSpacing: '0.2px',
};

const nav: React.CSSProperties = {
  flex: 1,
  padding: '20px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  overflowY: 'auto',
};

const navItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all 0.15s',
};

const sidebarFooter: React.CSSProperties = {
  padding: '16px 12px',
  borderTop: '1px solid #232220',
};

const logoutBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '10px 12px',
  background: 'none',
  border: 'none',
  borderRadius: '8px',
  color: '#EF4444',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.15s',
};

// Mobile styles
const mobileHeader: React.CSSProperties = {
  display: 'none',
  height: '56px',
  background: '#141413',
  borderBottom: '1px solid #2E2C29',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 30,
} as any;

const menuToggle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
};

const profileAvatarSmall: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  background: '#C9940F',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '11px',
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0,0,0,0.6)',
  zIndex: 50,
  display: 'flex',
};

const overlayContent: React.CSSProperties = {
  width: '280px',
  background: '#141413',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
};

const overlayHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  paddingBottom: '12px',
  borderBottom: '1px solid #232220',
};

const adminProfileMobile: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '24px',
};

const navMobile: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
};

const navItemMobile: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 500,
  textDecoration: 'none',
};

const logoutBtnMobile: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '12px',
  background: 'none',
  border: 'none',
  borderRadius: '8px',
  color: '#EF4444',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
};

const mainContent: React.CSSProperties = {
  flex: 1,
  paddingLeft: '240px', // Matches sidebar width
  minWidth: 0,
  minHeight: '100vh',
};

const contentInner: React.CSSProperties = {
  padding: '40px',
  maxWidth: '1200px',
  margin: '0 auto',
};

// Add desktop/mobile media query injection for CSS
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 767px) {
      aside { display: none !important; }
      header { display: flex !important; }
      main { padding-left: 0 !important; padding-top: 56px !important; }
      main > div { padding: 20px !important; }
    }
  `;
  document.head.appendChild(style);
}
