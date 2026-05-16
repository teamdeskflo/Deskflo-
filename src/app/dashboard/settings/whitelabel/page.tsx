'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/lib/auth-context';
import { Palette, Info, Zap } from 'lucide-react';

export default function SettingsWhitelabelPage() {
  const user = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>('deskflo_logo.png');
  const [brandColor, setBrandColor] = useState('#5A7350');
  const [showPoweredBy, setShowPoweredBy] = useState(true);

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      setLogoName(file.name);
    }
  };

  const handleLogoRemove = () => {
    setLogoUrl(null);
    setLogoName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    alert("White-Label settings saved successfully!\n\nReady for Supabase backend integration.");
  };

  // Derive a username-like string for the URL
  const usernameSlug = user.name.toLowerCase().replace(/\s+/g, '');

  return (
    <div style={{ width: '100%' }}>
      {/* Title */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Settings - White-Label Branding
      </h1>

      {/* White-Label Card */}
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
          <Palette size={20} color="currentColor" strokeWidth={2.5} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            WHITE-LABEL BRANDING
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
            (Your brand appears on client portal. One brand for all your clients.)
          </p>
          
          {/* Your Logo Section */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Your Logo:
            </label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            <button onClick={handleLogoUpload} style={{
              width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '8px'
            }}>
              Upload Logo
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Current: {logoName || 'None'}
              </span>
              {logoName && (
                <button onClick={handleLogoRemove} style={{
                  padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>
                  Remove
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Recommended: PNG, 200x60px, transparent background
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            
            {/* Left Column */}
            <div>
              {/* Brand Color */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Brand Color:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: brandColor, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>Hex: [{brandColor}]</span>
                  <input 
                    type="color" 
                    value={brandColor} 
                    onChange={(e) => setBrandColor(e.target.value)}
                    style={{
                      width: '0', height: '0', padding: 0, border: 'none', opacity: 0, position: 'absolute'
                    }}
                    id="color-picker"
                  />
                  <button onClick={() => document.getElementById('color-picker')?.click()} style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                    background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Pick Color
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Preview:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: brandColor }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4, flex: 1 }}>
                    Buttons, links, and borders will use this color
                  </p>
                </div>
              </div>

              {/* Powered by Deskflo */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  "Powered by Deskflo":
                </label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={showPoweredBy}
                    onChange={(e) => setShowPoweredBy(e.target.checked)}
                    disabled
                    style={{ marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    Show "Powered by Deskflo" at bottom of client pages (Mandatory)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Info size={14} color="var(--text-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    This cannot be removed on any plan.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {/* Client Portal URL */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Client Portal URL:
                </label>
                <input 
                  type="text" 
                  value={`client.deskflo.in/${usernameSlug}`}
                  readOnly
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '13px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-primary)', background: 'var(--content-bg)',
                    marginBottom: '8px'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Info size={14} color="var(--text-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Custom domain is not available. This URL cannot be changed.
                  </span>
                </div>
              </div>

              {/* Portal Preview */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Preview:
                </label>
                <div style={{ 
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', 
                  background: 'var(--card-bg)', overflow: 'hidden'
                }}>
                  {/* Mock Portal Header */}
                  <div style={{ background: 'var(--border-light)', padding: '12px', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" style={{ maxHeight: '30px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>[Your Logo Here]</span>
                    )}
                  </div>
                  {/* Mock Portal Content */}
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: 'var(--text-primary)' }}>Client Portal</h4>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>Welcome to your project portal</p>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <button style={{ 
                        background: brandColor, color: 'white', border: 'none', 
                        padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 500 
                      }}>
                        Preview Button
                      </button>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>— [Your Brand Color]</span>
                    </div>
                  </div>
                  {/* Mock Portal Footer */}
                  {showPoweredBy && (
                    <div style={{ background: 'var(--content-bg)', padding: '8px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.5 }}>
                        <Zap size={10} color="var(--text-primary)" />
                        <span style={{ fontSize: '10px', color: 'var(--text-primary)', fontWeight: 500 }}>Powered by Deskflo</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>(dim text at bottom)</span>
                      </div>
                    </div>
                  )}
                  {/* Refresh Preview */}
                  <div style={{ padding: '8px', display: 'flex', justifyContent: 'center', background: 'var(--card-bg)', borderTop: '1px solid var(--border)' }}>
                    <button style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                      background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}>
                      Refresh Preview
                    </button>
                  </div>
                </div>
              </div>
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
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
