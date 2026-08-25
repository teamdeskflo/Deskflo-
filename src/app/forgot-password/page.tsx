'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    border: '1px solid var(--border)', borderRadius: '10px',
    background: 'var(--card-bg)', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--content-bg)', padding: '24px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Real Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
          <img src="/deskflo.png" alt="Deskflo Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Deskflo</span>
        </div>

        {/* Content Card */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
          boxShadow: 'var(--shadow-md)',
        }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle size={28} color="var(--success)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Reset link sent
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 24px' }}>
                We sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and click the link to choose a new password.
              </p>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: 'var(--accent-dark)', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none'
              }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.4px', textAlign: 'center' }}>
                Forgot Password
              </h1>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5, textAlign: 'center' }}>
                Enter your email address below and we will send you a secure link to reset your password.
              </p>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '18px',
                  background: 'var(--error-light)', border: '1px solid var(--error)',
                  color: 'var(--error)', fontSize: '13px', fontWeight: 500,
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '12px',
                    background: loading ? 'var(--border)' : 'var(--btn-primary-bg)',
                    color: 'var(--btn-primary-text)',
                    border: 'none', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {loading ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                  ) : (
                    <><Mail size={16} /> Send Password Reset Link</>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <Link href="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textDecoration: 'none'
                  }}>
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
