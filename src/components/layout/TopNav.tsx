'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, X, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  text: React.ReactNode;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: '1', text: <><strong style={{ color: 'var(--text-primary)' }}>Priya Mehta</strong> viewed Homepage_v3.fig</> },
  { id: '2', text: <><strong style={{ color: 'var(--text-primary)' }}>Invoice INV-001</strong> was paid.</> },
  { id: '3', text: <><strong style={{ color: 'var(--text-primary)' }}>System:</strong> Trial expires in 7 days.</> },
];

export default function TopNav() {
  const user   = useUser();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Check local storage on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, isMounted]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dismissNotification = (id: string) => {
    // 1. Mark as removing to trigger animation
    setRemovingIds(prev => new Set(prev).add(id));
    
    // 2. Actually remove from state after animation completes (300ms)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <header style={{
      height: 'var(--topnav-height)',
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 20,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Logo wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Image src="/deskflo.png" alt="Deskflo" width={28} height={24} />
        <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
          DESKFL<span style={{ color: 'var(--accent)' }}>O</span>
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Notification bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            style={{
              position: 'relative', background: 'transparent', border: 'none',
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px',
              borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center',
              transition: 'background 0.15s',
            }} 
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Notifications"
          >
            <Bell size={19} strokeWidth={1.8} />
            {/* Unread badge */}
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--accent)', border: '2px solid var(--card-bg)',
              }} />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              width: '320px', background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden', zIndex: 30,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Notifications {notifications.length > 0 && `(${notifications.length})`}
                </h3>
              </div>
              <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '12px 8px', margin: 0, fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    You're all caught up!
                  </p>
                ) : (
                  notifications.map(n => {
                    const isRemoving = removingIds.has(n.id);
                    return (
                      <div 
                        key={n.id} 
                        style={{
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                          padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                          fontSize: '13px', color: 'var(--text-muted)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isRemoving ? 'translateX(100%)' : 'translateX(0)',
                          opacity: isRemoving ? 0 : 1,
                          height: isRemoving ? 0 : 'auto',
                          margin: isRemoving ? 0 : '0 0 2px',
                          paddingTop: isRemoving ? 0 : '10px',
                          paddingBottom: isRemoving ? 0 : '10px',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={e => !isRemoving && (e.currentTarget.style.background = 'var(--content-bg)')}
                        onMouseLeave={e => !isRemoving && (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ flex: 1, lineHeight: 1.4, opacity: isRemoving ? 0 : 1, transition: 'opacity 0.2s' }}>
                          {n.text}
                        </div>
                        <button
                          onClick={() => dismissNotification(n.id)}
                          style={{
                            background: 'transparent', border: 'none', padding: '4px',
                            cursor: 'pointer', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '4px', opacity: isRemoving ? 0 : 1, transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '6px 12px',
              cursor: 'pointer', color: 'var(--text-primary)',
              fontSize: '13px', fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <User size={15} strokeWidth={1.8} color="var(--text-secondary)" />
            <span>{user.name.split(' ')[0]}</span>
            <ChevronDown size={14} strokeWidth={2} color="var(--text-muted)" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: '200px', background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
              overflow: 'hidden', zIndex: 30,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 2px', color: 'var(--text-primary)' }}>{user.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
              </div>
              <div style={{ padding: '6px' }}>
                <button onClick={() => { setIsDarkMode(!isDarkMode); setShowProfile(false); }} style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', background: 'transparent', border: 'none',
                  fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {isDarkMode ? <Sun size={14} /> : <Moon size={14} />} {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Link href="/dashboard/settings" style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', background: 'transparent', border: 'none',
                  fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setShowProfile(false)}
                >
                  <Settings size={14} /> Account Settings
                </Link>
                <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }} />
                <button onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push('/login');
                    router.refresh();
                  }} style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', background: 'transparent', border: 'none',
                  fontSize: '13px', color: 'var(--error)', cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--error-light)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
