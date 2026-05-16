'use client';

import { useState } from 'react';
import { useUser } from '@/lib/auth-context';
import { Bell, Info, X } from 'lucide-react';

export default function SettingsNotificationsPage() {
  const user = useUser();
  
  // Email state
  const [emailSettings, setEmailSettings] = useState({
    fileApproval: true,
    invoicePaid: true,
    weeklyDigest: true,
    marketing: false,
  });
  const [notifEmail, setNotifEmail] = useState(user.email);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');

  // WhatsApp state
  const [whatsappSettings, setWhatsappSettings] = useState({
    fileApproval: true,
    invoicePaid: true,
    paymentReminder: true,
  });
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');

  // Auto-Reminders state
  const [reminderSettings, setReminderSettings] = useState({
    fileUnviewed3d: true,
    secondReminder5d: true,
    paymentReminder3d: true,
    overdueReminder7d: true,
  });
  const [reminderTime, setReminderTime] = useState('10:00');

  const handleEmailChange = () => {
    setTempEmail(notifEmail);
    setIsEmailModalOpen(true);
  };

  const saveEmail = () => {
    if (tempEmail.trim()) {
      setNotifEmail(tempEmail);
      setIsEmailModalOpen(false);
    }
  };

  const handleVerifyWhatsapp = () => {
    alert("OTP sent to " + whatsappNumber + ".\n\nIn a real app, this would open an OTP verification modal.");
  };

  const handleSave = () => {
    alert("Notification preferences saved successfully!\n\nReady for backend integration.");
  };

  // Reusable checkbox component for styling consistency
  const CheckboxRow = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={e => onChange(e.target.checked)} 
        style={{ 
          marginTop: '3px', width: '16px', height: '16px', 
          accentColor: 'var(--text-primary)', cursor: 'pointer' 
        }}
      />
      <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{label}</span>
    </label>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Title */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Settings - Notifications
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
          <Bell size={20} color="var(--accent-dark)" strokeWidth={2.5} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            NOTIFICATION SETTINGS
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Email Notifications */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Email Notifications:
            </h3>
            <div style={{ background: 'var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
              <CheckboxRow label="Client approves a file" checked={emailSettings.fileApproval} onChange={v => setEmailSettings({...emailSettings, fileApproval: v})} />
              <CheckboxRow label="Client pays an invoice" checked={emailSettings.invoicePaid} onChange={v => setEmailSettings({...emailSettings, invoicePaid: v})} />
              <CheckboxRow label="Weekly digest (summary of activity)" checked={emailSettings.weeklyDigest} onChange={v => setEmailSettings({...emailSettings, weeklyDigest: v})} />
              <div style={{ marginBottom: 0 }}>
                <CheckboxRow label="Marketing emails (tips, updates, offers)" checked={emailSettings.marketing} onChange={v => setEmailSettings({...emailSettings, marketing: v})} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Email address for notifications: <strong>{notifEmail}</strong></span>
              <button onClick={handleEmailChange} style={{
                padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>
                Change
              </button>
            </div>
          </div>

          {/* WhatsApp Alerts */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              WhatsApp Alerts:
            </h3>
            <div style={{ background: 'var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
              <CheckboxRow label="Client approves a file" checked={whatsappSettings.fileApproval} onChange={v => setWhatsappSettings({...whatsappSettings, fileApproval: v})} />
              <CheckboxRow label="Client pays an invoice" checked={whatsappSettings.invoicePaid} onChange={v => setWhatsappSettings({...whatsappSettings, invoicePaid: v})} />
              <div style={{ marginBottom: 0 }}>
                <CheckboxRow label="Payment reminder (3 days before due)" checked={whatsappSettings.paymentReminder} onChange={v => setWhatsappSettings({...whatsappSettings, paymentReminder: v})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>WhatsApp Number:</span>
              <input 
                type="text" 
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                style={{
                  padding: '6px 10px', fontSize: '14px', width: '150px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                }}
              />
              <button onClick={handleVerifyWhatsapp} style={{
                padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                Verify
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <Info size={14} color="var(--text-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                WhatsApp alerts require a verified number. Click Verify to receive an OTP on your WhatsApp.
              </span>
            </div>
          </div>

          {/* Auto-Reminders */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              Auto-Reminders:
            </h3>
            <div style={{ background: 'var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
              <CheckboxRow label="Send reminder if client hasn't viewed file in 3 days" checked={reminderSettings.fileUnviewed3d} onChange={v => setReminderSettings({...reminderSettings, fileUnviewed3d: v})} />
              <CheckboxRow label="Send second reminder in 5 days" checked={reminderSettings.secondReminder5d} onChange={v => setReminderSettings({...reminderSettings, secondReminder5d: v})} />
              <CheckboxRow label="Send payment reminder 3 days before due date" checked={reminderSettings.paymentReminder3d} onChange={v => setReminderSettings({...reminderSettings, paymentReminder3d: v})} />
              <div style={{ marginBottom: 0 }}>
                <CheckboxRow label="Send overdue reminder 7 days after due date" checked={reminderSettings.overdueReminder7d} onChange={v => setReminderSettings({...reminderSettings, overdueReminder7d: v})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Auto-reminder time:</span>
              <input 
                type="time" 
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                style={{
                  padding: '6px 10px', fontSize: '14px', width: '120px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>(IST)</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
            <button style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button onClick={handleSave} style={{
              background: 'var(--text-primary)', color: 'var(--card-bg)', border: 'none', 
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Save Preferences
            </button>
          </div>

        </div>
      </div>

      {/* Update Email Modal */}
      {isEmailModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '400px', borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Update Notification Email</h3>
              <button onClick={() => setIsEmailModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Email Address
              </label>
              <input 
                type="email" 
                value={tempEmail}
                onChange={e => setTempEmail(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', background: 'var(--content-bg)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                  marginBottom: '20px'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setIsEmailModalOpen(false)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Cancel
                </button>
                <button onClick={saveEmail} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: 'var(--text-primary)', color: 'var(--card-bg)', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
