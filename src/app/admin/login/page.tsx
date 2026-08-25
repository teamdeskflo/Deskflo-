'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <div style={header}>
          <div style={logoWrapper}>
            <Shield size={28} color="#D4A017" />
          </div>
          <h1 style={title}>Deskflo Admin</h1>
          <p style={subtitle}>Sign in to access control center</p>
        </div>

        {error && <div style={errorBanner}>{error}</div>}

        <form onSubmit={handleLogin} style={form}>
          <div style={inputGroup}>
            <label style={label}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@deskflo.in"
              required
              disabled={loading}
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label style={label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={input}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={eyeBtn}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={btn}>
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const container: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0E0E0D', // Match globals.css dark mode canvas
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  fontFamily: "'Inter', sans-serif",
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  background: '#1B1A18', // Card bg
  border: '1px solid #2E2C29', // Border
  borderRadius: '14px',
  padding: '40px 32px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const header: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '28px',
};

const logoWrapper: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: 'rgba(212, 160, 23, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};

const title: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#DEDAD5',
  margin: '0 0 6px',
  letterSpacing: '-0.5px',
};

const subtitle: React.CSSProperties = {
  fontSize: '13px',
  color: '#9E9B94',
  margin: 0,
};

const errorBanner: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.12)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
  borderRadius: '8px',
  color: '#EF4444',
  fontSize: '13px',
  fontWeight: 500,
  padding: '10px 14px',
  marginBottom: '20px',
  lineHeight: 1.4,
};

const form: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const inputGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const label: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#9E9B94',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: '#141413',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#DEDAD5',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: '#6B6860',
  cursor: 'pointer',
  padding: 0,
};

const btn: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  background: '#C9940F', // Admin theme color
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(201, 148, 15, 0.2)',
  marginTop: '8px',
};
