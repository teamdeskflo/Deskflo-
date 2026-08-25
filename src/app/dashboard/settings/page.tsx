'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/auth-context';
import { User, Image as ImageIcon, Key, Mail, ShieldCheck, X, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SettingsProfilePage() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gst: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Modal States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.profile) {
          setFormData({
            name: data.profile.name || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
            company: data.profile.company_name || '',
            gst: data.profile.gst || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handlePhotoRemove = () => {
    setPhotoUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger Supabase password change link email
  const handleSendVerificationEmail = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (err: any) {
      setModalError(err.message || 'Failed to send verification email.');
    } finally {
      setModalLoading(false);
    }
  };

  // Save changes to Supabase via settings PUT route
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'profile',
          name: formData.name,
          phone: formData.phone,
          company_name: formData.company,
          gst: formData.gst,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      alert("Profile settings saved successfully!");
    } catch (err: any) {
      alert(`Error saving changes: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      setModalSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setConfirmPassword('');
        setModalSuccess(false);
        setEmailSent(false);
      }, 2000);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update password.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}>
      {/* Title */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Settings Profile
      </h1>

      {/* Profile Information Card */}
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
          <User size={20} color="currentColor" strokeWidth={2.5} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            PROFILE INFORMATION
          </h2>
        </div>

        {/* Body */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '10px', color: 'var(--text-secondary)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading settings...
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            
            {/* Avatar Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Avatar:
              </label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                
                {/* Avatar Box */}
                <div style={{
                  width: '100px', height: '100px', 
                  background: 'var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)', overflow: 'hidden'
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={48} color="#64748B" />
                  )}
                </div>
                
                {/* Avatar Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handlePhotoUpload} style={{
                      padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      Change Photo
                    </button>
                    <button onClick={handlePhotoRemove} style={{
                      padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      Remove
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Recommended: 200x200px, PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Form Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Full Name<span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '14px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                  }}
                />
              </div>
              {/* Email */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Email<span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input 
                  required
                  disabled
                  value={formData.email}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '14px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-muted)', background: 'var(--border-light)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Phone (defaults to empty) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Phone
              </label>
              <input 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number (e.g. +91 98765 43210)"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                }}
              />
            </div>

            {/* Company (defaults to empty) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Company <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
              </label>
              <input 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                placeholder="Enter your company name"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                }}
              />
            </div>

            {/* GST (defaults to empty) */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                GST Number <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
              </label>
              <input 
                value={formData.gst}
                onChange={e => setFormData({...formData, gst: e.target.value})}
                placeholder="Enter GSTIN (e.g. 27AAAAA1234A1Z)"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="password"
                  value="••••••••••••••"
                  readOnly
                  style={{
                    flex: 1, padding: '10px 14px', fontSize: '14px', letterSpacing: '2px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-muted)', background: 'var(--border-light)',
                    cursor: 'not-allowed'
                  }}
                />
                <button 
                  onClick={() => setIsPasswordModalOpen(true)} 
                  style={{
                    padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Key size={14} /> Change Password
                </button>
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
              <button 
                disabled={saveLoading}
                onClick={handleSave} 
                style={{
                  background: saveLoading ? 'var(--border)' : '#1F2937', color: 'white', border: 'none', 
                  padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                  fontSize: '14px', fontWeight: 600, cursor: saveLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {saveLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Changes'}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Password Change Popup Modal */}
      {isPasswordModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '480px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="var(--accent-dark)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>SECURE PASSWORD CHANGE</h3>
              </div>
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setEmailSent(false);
                  setModalError('');
                }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {modalSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Check size={24} color="var(--success)" />
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Password Updated Successfully!
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {modalError && (
                    <div style={{
                      padding: '10px 14px', borderRadius: '8px',
                      background: 'var(--error-light)', border: '1px solid var(--error)',
                      color: 'var(--error)', fontSize: '13px', fontWeight: 500,
                    }}>
                      {modalError}
                    </div>
                  )}

                  {/* Verification flow notice */}
                  <div style={{
                    display: 'flex', gap: '8px', background: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px',
                    padding: '12px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4,
                  }}>
                    <Mail size={18} color="#3B82F6" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      {emailSent ? (
                        <span>
                          Verification email sent! Click the recovery link sent to <strong>{formData.email}</strong> to set a new password, or proceed below.
                        </span>
                      ) : (
                        <span>
                          To secure your account, we recommend sending a secure password changing link to your registered email first.
                        </span>
                      )}
                    </div>
                  </div>

                  {!emailSent ? (
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={handleSendVerificationEmail}
                      style={{
                        padding: '10px', borderRadius: '10px', border: '1px solid var(--border)',
                        background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13.5px',
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      {modalLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Verification Email Link'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: 'var(--success)', fontWeight: 700 }}>
                      <Check size={16} /> Link Sent to Inbox!
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                  {/* Manual Fields */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      New Password
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: '14px',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>
                      Confirm New Password
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: '14px',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                        outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsPasswordModalOpen(false);
                        setNewPassword('');
                        setConfirmPassword('');
                        setEmailSent(false);
                        setModalError('');
                      }} 
                      style={{ 
                        padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', 
                        background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={modalLoading}
                      style={{ 
                        padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', 
                        background: '#1F2937', color: 'white', fontSize: '13px', fontWeight: 600, 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      {modalLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
