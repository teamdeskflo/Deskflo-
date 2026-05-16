'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/lib/auth-context';
import { User, Image as ImageIcon } from 'lucide-react';

export default function SettingsProfilePage() {
  const user = useUser();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: '+91 98765 43210',
    company: 'Rishi Designs',
    gst: '27AAAAA1234A1Z',
    password: '*************'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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

  const handlePasswordChange = () => {
    const newPass = prompt("Enter new password:");
    if (newPass) {
      setFormData({ ...formData, password: newPass });
      alert("Password updated locally! Click Save Changes to persist.");
    }
  };

  const handleSave = () => {
    alert("Profile settings saved successfully!\n\nThis is a fully functional UI ready for Supabase backend integration.");
  };

  return (
    <div style={{ width: '100%' }}>
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
          background: 'var(--border-light)', // Light beige/greenish tint from image
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
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)'
                }}
              />
            </div>
            {/* Email */}
            <div>
              <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Email<span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '14px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Phone
            </label>
            <input 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Company */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Company <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
            </label>
            <input 
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* GST */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              GST Number <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Optional)</span>
            </label>
            <input 
              value={formData.gst}
              onChange={e => setFormData({...formData, gst: e.target.value})}
              style={{
                width: '100%', padding: '10px 14px', fontSize: '14px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)'
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
                value={formData.password}
                readOnly
                style={{
                  flex: 1, padding: '10px 14px', fontSize: '14px', letterSpacing: '2px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--content-bg)'
                }}
              />
              <button onClick={handlePasswordChange} style={{
                padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', whiteSpace: 'nowrap'
              }}>
                Change Password
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
            <button onClick={handleSave} style={{
              background: '#1F2937', color: 'white', border: 'none', 
              padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
