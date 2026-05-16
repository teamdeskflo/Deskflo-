'use client';

import { useState } from 'react';
import { CreditCard, X, Download, AlertTriangle } from 'lucide-react';

export default function SettingsBillingPage() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
  
  const [upiId, setUpiId] = useState('rishi@okhdfsbank');
  const [tempUpi, setTempUpi] = useState('');

  const billingHistory = [
    { id: 'INV-2026-05', date: '15 May 2026', plan: 'Deskflo Pro', amount: '₹299' },
    { id: 'INV-2026-04', date: '15 April 2026', plan: 'Deskflo Pro', amount: '₹299' },
    { id: 'INV-2026-03', date: '15 March 2026', plan: 'Deskflo Pro', amount: '₹299' },
  ];

  const handleDownload = (id: string) => {
    alert(`Downloading invoice ${id} PDF...`);
  };

  const savePaymentMethod = () => {
    if (tempUpi.trim()) {
      setUpiId(tempUpi);
      setIsPaymentModalOpen(false);
    }
  };

  const confirmCancel = () => {
    alert("Subscription cancelled. You will have access until 15 June 2026.");
    setIsCancelModalOpen(false);
  };

  const confirmAnnual = () => {
    alert("Switched to Annual Plan! Your new billing cycle starts on 15 June 2026 for ₹2,990.");
    setIsAnnualModalOpen(false);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Title */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Settings - Billing
      </h1>

      {/* Main Card */}
      <div style={{ 
        background: 'var(--card-bg)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        maxWidth: '800px'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'var(--border-light)', 
          padding: '16px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          borderBottom: '1px solid var(--border)'
        }}>
          <CreditCard size={20} color="var(--accent-dark)" strokeWidth={2.5} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            BILLING & SUBSCRIPTION
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Current Plan */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Current Plan:
            </h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Plan Card */}
              <div style={{ 
                background: 'var(--accent-light)', 
                border: '1px solid var(--accent)', 
                borderRadius: 'var(--radius-md)', 
                padding: '16px',
                width: '260px',
                boxShadow: '0 4px 12px rgba(212, 160, 23, 0.1)'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '0.5px' }}>DESKFLO PRO</h4>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
                    ₹299<span style={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>/month</span>
                  </div>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', color: '#111827', fontSize: '13px', lineHeight: 1.6 }}>
                  <li>• Up to 50 clients</li>
                  <li>• 20GB storage</li>
                  <li>• White-label (logo + color)</li>
                  <li>• All features included</li>
                </ul>
              </div>

              {/* Billing Info */}
              <div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Next billing date: <strong>15 June 2026</strong>
                </p>
                <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-primary)' }}>
                  Amount: <strong>₹299</strong>
                </p>
                <button onClick={() => setIsCancelModalOpen(true)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--error)',
                  background: 'var(--error-light)', color: 'var(--error)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Payment Method:
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                Current: UPI ID — <strong>{upiId}</strong>
              </span>
              <button onClick={() => { setTempUpi(upiId); setIsPaymentModalOpen(true); }} style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                Change Payment Method
              </button>
            </div>
          </div>

          {/* Billing History */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Billing History:
            </h3>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--border-light)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Plan</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{item.date}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{item.plan}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{item.amount}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                        <button onClick={() => handleDownload(item.id)} style={{
                          background: 'transparent', border: 'none', color: 'var(--accent-dark)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0
                        }}>
                           Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Annual Plan */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Annual Plan (Save 16%):
              </h3>
              <p style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--text-primary)' }}>
                Pay ₹2,990/year instead of <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹3,588</span>
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>
                You save ₹598
              </p>
            </div>
            <button onClick={() => setIsAnnualModalOpen(true)} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--accent-dark)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Switch to Annual Plan
            </button>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Change Payment Method Modal */}
      {isPaymentModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '400px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Update Payment Method</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                UPI ID / VPA
              </label>
              <input 
                type="text" value={tempUpi} onChange={e => setTempUpi(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--content-bg)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', marginBottom: '20px'
                }}
                autoFocus placeholder="e.g. name@bank"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setIsPaymentModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={savePaymentMethod} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text-primary)', color: 'var(--card-bg)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Save UPI ID</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '400px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--error-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={24} color="var(--error)" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Cancel Subscription?</h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You will lose access to all premium features on <strong>15 June 2026</strong>. Are you sure you want to cancel?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setIsCancelModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Keep Plan</button>
                <button onClick={confirmCancel} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--error)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Switch to Annual Modal */}
      {isAnnualModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '440px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Switch to Annual Plan</h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                By switching to the annual plan, you will be billed <strong>₹2,990 immediately</strong>. Your new billing cycle will cover you for a full year.
              </p>
              <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '24px', color: 'var(--success)', fontWeight: 600, fontSize: '14px' }}>
                You will save ₹598/year!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button onClick={() => setIsAnnualModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={confirmAnnual} style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-dark)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>Confirm & Pay ₹2,990</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
