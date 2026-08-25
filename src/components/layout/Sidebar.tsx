'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard, Users, FolderOpen, Paperclip,
  CheckSquare, Receipt, MessageSquare, Scale,
  TrendingUp, Settings, X, Menu, ArrowRight
} from 'lucide-react';
import { useUser, getInitials, trialDaysRemaining, trialProgressPercent } from '@/lib/auth-context';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard',            label: 'Overview',   Icon: LayoutDashboard },
  { href: '/dashboard/clients',    label: 'Clients',    Icon: Users           },
  { href: '/dashboard/projects',   label: 'Projects',   Icon: FolderOpen      },
  { href: '/dashboard/files',      label: 'Files',      Icon: Paperclip       },
  { href: '/dashboard/tasks',      label: 'Tasks',      Icon: CheckSquare     },
  { href: '/dashboard/invoices',   label: 'Invoices',   Icon: Receipt         },
  { href: '/dashboard/messages',   label: 'Messages',   Icon: MessageSquare   },
  { href: '/dashboard/legal',      label: 'Legal',      Icon: Scale           },
  { href: '/dashboard/analytics',  label: 'Analytics',  Icon: TrendingUp      },
  { 
    href: '/dashboard/settings',   label: 'Settings',   Icon: Settings,
    subItems: [
      { href: '/dashboard/settings', label: 'Profile' },
      { href: '/dashboard/settings/whitelabel', label: 'White-Label' },
      { href: '/dashboard/settings/billing', label: 'Billing' },
      { href: '/dashboard/settings/notifications', label: 'Notification' },
      { href: '/dashboard/settings/data', label: 'Data & Privacy' },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const daysLeft = trialDaysRemaining(user.trial_ends_at);
  const trialProgress = trialProgressPercent(user.trial_starts_at, user.trial_ends_at);
  const isUrgent = daysLeft <= 3;

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', desktopOpen ? '220px' : '70px');
  }, [desktopOpen]);

  const SidebarContent = () => (
    <div style={{
      width: desktopOpen ? '220px' : '70px', minHeight: '100vh', background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      transition: 'width 0.2s ease', overflowX: desktopOpen ? 'hidden' : 'visible'
    }}>
      {/* Header */}
      <div style={{
        padding: desktopOpen ? '16px 20px' : '16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: desktopOpen ? 'space-between' : 'center',
        minHeight: '60px'
      }}>
        {desktopOpen && <span style={{
          color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px',
        }}>deskflo</span>}
        
        {/* Desktop close/open button */}
        <button
          onClick={() => setDesktopOpen(!desktopOpen)}
          className="desktop-only"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}
          title={desktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {desktopOpen ? <X size={18} /> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Menu size={18} />
              <ArrowRight size={12} strokeWidth={3} />
            </div>
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="mobile-only"
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px' }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map(({ href, label, Icon, subItems }) => {
          const isParentActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
          const isExactActive = pathname === href;
          
          return (
            <div
              key={href} 
              style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
              onMouseEnter={() => setHoveredNav(href)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Link
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: desktopOpen ? 'flex-start' : 'center',
                  gap: '10px', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                  background: isParentActive ? 'var(--sidebar-active)' : 'transparent',
                  color: isParentActive ? 'white' : 'rgba(255,255,255,0.55)',
                  fontWeight: isParentActive ? 600 : 400, fontSize: '13.5px',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                }}
                title={!desktopOpen ? label : undefined}
              >
                <Icon size={18} strokeWidth={isParentActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                {desktopOpen && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>}
              </Link>
              
              {/* Sub-items */}
              {subItems && desktopOpen && (
                <div style={{ 
                  display: 'grid',
                  gridTemplateRows: hoveredNav === href ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin 0.4s ease',
                  opacity: hoveredNav === href ? 1 : 0,
                  marginTop: hoveredNav === href ? '6px' : '0px',
                  marginBottom: hoveredNav === href ? '4px' : '0px',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '38px' }}>
                      {subItems.map(sub => {
                        const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          fontSize: '12.5px', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                          color: isSubActive ? 'white' : 'rgba(255,255,255,0.5)',
                          background: isSubActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                          fontWeight: isSubActive ? 500 : 400, textDecoration: 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-items Flyout (when collapsed) */}
              {subItems && !desktopOpen && hoveredNav === href && (
                <div style={{
                  position: 'absolute',
                  left: '100%',
                  top: '0',
                  paddingLeft: '12px',
                  zIndex: 50,
                }}>
                  <div style={{
                    background: '#0B0C0E', // Force dark background for flyout
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    minWidth: '160px',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {/* Flyout Title */}
                    <div style={{ padding: '4px 10px 8px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      {label}
                    </div>
                    {subItems.map(sub => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            fontSize: '13px', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                            color: isSubActive ? 'white' : 'rgba(255,255,255,0.7)',
                            background: isSubActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            fontWeight: isSubActive ? 500 : 400, textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Trial Banner */}
      {user.subscription_status === 'trial' && desktopOpen && (
        <div style={{
          margin: '0 10px 12px', padding: '12px 14px',
          background: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(212,160,23,0.1)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(212,160,23,0.2)'}`,
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ color: isUrgent ? 'var(--error)' : 'var(--accent)', fontSize: '11px', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            {isUrgent ? '⚠️ Trial Expiring' : 'Free Trial'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 8px' }}>
            {daysLeft === 0 ? 'Expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
          </p>
          {/* Dynamic progress bar based on actual trial_starts_at → trial_ends_at */}
          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{
              width: `${trialProgress}%`,
              height: '100%', borderRadius: '2px',
              background: isUrgent ? 'var(--error)' : 'var(--accent)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {/* User */}
      <Link href="/dashboard/settings" style={{
        padding: desktopOpen ? '14px 16px' : '14px 0',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: desktopOpen ? 'flex-start' : 'center', gap: '10px',
        textDecoration: 'none', transition: 'background 0.2s', cursor: 'pointer'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: '12px',
          color: 'var(--sidebar-bg)', flexShrink: 0,
        }} title={!desktopOpen ? user.name : undefined}>
          {getInitials(user.name)}
        </div>
        {desktopOpen && (
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'white', fontSize: '12.5px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
          </div>
        )}
      </Link>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          }}
          className="mobile-only"
        />
      )}

      {/* Mobile open button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="mobile-only"
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
          background: 'var(--sidebar-bg)', color: 'white', border: 'none',
          cursor: 'pointer', boxShadow: 'var(--shadow-md)',
        }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside
        className="desktop-only"
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 40,
          height: '100vh', boxShadow: '2px 0 12px rgba(0,0,0,0.12)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <aside
          className="mobile-only"
          style={{
            position: 'fixed', top: 0, left: 0, zIndex: 40,
            height: '100vh', boxShadow: 'var(--shadow-lg)',
          }}
        >
          <SidebarContent />
        </aside>
      )}
    </>
  );
}
