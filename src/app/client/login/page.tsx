'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, KeyRound, Sparkles } from 'lucide-react';

export default function ClientLoginPage() {
  const [freelancerEmail, setFreelancerEmail] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancerEmail || !loginToken) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerEmail: freelancerEmail.trim(), loginToken: loginToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Store cookie for 30 days
      const maxAge = 30 * 24 * 60 * 60;
      document.cookie = `client_session=${data.sessionToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

      router.push('/client/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Logo Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 20px rgba(29, 78, 216, 0.3)'
        }}>
          <ShieldCheck size={32} color="#FFFFFF" strokeWidth={1.5} />
        </div>

        {/* Headings */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#F8FAFC',
          margin: '0 0 8px',
          letterSpacing: '-0.5px'
        }}>
          Client Portal Access
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#94A3B8',
          margin: '0 0 32px',
          lineHeight: 1.5
        }}>
          Securely view your deliverables, approve files, and pay invoices.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#FCA5A5',
              marginBottom: '20px',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          )}

          {/* Freelancer Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="freelancerEmail" style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#CBD5E1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Freelancer's Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail size={16} />
              </div>
              <input
                id="freelancerEmail"
                type="email"
                required
                placeholder="e.g. freelancer@email.com"
                value={freelancerEmail}
                onChange={e => setFreelancerEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#F8FAFC',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Client Access Token Field */}
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="loginToken" style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#CBD5E1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Access Token
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center'
              }}>
                <KeyRound size={16} />
              </div>
              <input
                id="loginToken"
                type="password"
                required
                placeholder="Enter client access token"
                value={loginToken}
                onChange={e => setLoginToken(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#F8FAFC',
                  transition: 'all 0.2s ease'
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.75 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Enter Client Portal'}
          </button>
        </form>

        {/* Footer brand branding */}
        <div style={{
          marginTop: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '11px',
          color: '#64748B',
          fontWeight: 500
        }}>
          <Sparkles size={11} color="#3B82F6" />
          <span>Secured by Deskflo White-Label Engine</span>
        </div>
      </div>
    </div>
  );
}
