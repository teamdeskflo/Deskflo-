'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Check, Sparkles, Loader2 } from 'lucide-react';

export default function OnboardingBillingPage() {
  const router = useRouter();
  const [method, setMethod] = useState<'card' | 'upi'>('card');
  const [loading, setLoading] = useState(false);
  
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiData, setUpiData] = useState({ upiId: '' });

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment mandate setup
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard?welcome=true');
    }, 2000);
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
          <img src="/deskflo.png" alt="Deskflo" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Deskflo</span>
        </div>

        {/* Progress Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'var(--accent)', color: '#111', fontSize: '11px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✓</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Create Account</span>
          </div>
          <div style={{ width: '24px', height: '1px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'var(--text-primary)', color: 'var(--card-bg)', fontSize: '11px', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>2</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>Autopay Setup</span>
          </div>
        </div>

        {/* Content Box */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '28px',
          boxShadow: 'var(--shadow-md)',
        }}>
          
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.4px', textAlign: 'center' }}>
            Setup Autopay Subscription
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.5, textAlign: 'center' }}>
            Activate your <strong>7-day free trial</strong> today. You will not be charged now. Cancel anytime before trial ends.
          </p>

          {/* Pricing Summary */}
          <div style={{
            background: 'var(--content-bg)', border: '1px solid var(--border-light)',
            borderRadius: '12px', padding: '16px', marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <span>7-Day Free Trial Access</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              <span>Monthly Subscription (after trial)</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹299 / mo</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              <span>Due Today</span>
              <span style={{ color: 'var(--success)' }}>₹0.00</span>
            </div>
          </div>

          <form onSubmit={handleActivate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Method Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Select Autopay Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    background: method === 'card' ? 'var(--text-primary)' : 'var(--card-bg)',
                    color: method === 'card' ? 'var(--card-bg)' : 'var(--text-primary)',
                    border: '1px solid var(--border)', fontSize: '13.5px', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  <CreditCard size={15} /> Card Autopay
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    background: method === 'upi' ? 'var(--text-primary)' : 'var(--card-bg)',
                    color: method === 'upi' ? 'var(--card-bg)' : 'var(--text-primary)',
                    border: '1px solid var(--border)', fontSize: '13.5px', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.15s'
                  }}
                >
                  ⚡ UPI Autopay
                </button>
              </div>
            </div>

            {/* Fields based on method */}
            {method === 'card' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Cardholder Name
                  </label>
                  <input
                    required type="text" placeholder="e.g. Rahul Sharma"
                    value={cardData.name} onChange={e => setCardData({ ...cardData, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Card Number
                  </label>
                  <input
                    required type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength={19}
                    value={cardData.number} onChange={e => setCardData({ ...cardData, number: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Expiry Date
                    </label>
                    <input
                      required type="text" placeholder="MM/YY" maxLength={5}
                      value={cardData.expiry} onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      CVV / CVN
                    </label>
                    <input
                      required type="password" placeholder="***" maxLength={3}
                      value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  UPI Virtual Payment Address (VPA) / UPI ID
                </label>
                <input
                  required type="text" placeholder="e.g. rahul@upi"
                  value={upiData.upiId} onChange={e => setUpiData({ ...upiData, upiId: e.target.value })}
                  style={inputStyle}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                  Supported vpases: @ybl, @paytm, @okhdfcbank, @okaxis, @upi etc.
                </p>
              </div>
            )}

            {/* Compliance Info */}
            <div style={{
              display: 'flex', gap: '8px', background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px',
              padding: '10px 12px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4,
            }}>
              <ShieldCheck size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Secure Payment Mandate:</strong> Subscriptions are secured by PCI-DSS bank level standards. Autopay mandates can be cancelled instantly at any time from your settings panel.
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--border)' : 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                border: 'none', borderRadius: '10px',
                fontSize: '14.5px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Setting up mandate...</>
              ) : (
                <>Activate 7-Day Free Trial →</>
              )}
            </button>
          </form>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
