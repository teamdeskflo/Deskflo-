'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';

interface SettingsData {
  registration_open: boolean;
  waitlist_enabled: boolean;
  support_email: string;
  maintenance_mode: boolean;
}

export default function PlatformSettings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setSettings(data.settings);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggle = (key: keyof SettingsData) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleEmailChange = (val: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      support_email: val,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert('Failed to save settings changes.');
      }
    } catch {
      alert('Error updating system configurations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={loadingWrap}>Loading platform parameters...</div>
      </AdminLayout>
    );
  }

  if (!settings) return null;

  return (
    <AdminLayout>
      <div style={header}>
        <div>
          <h1 style={title}>System Settings</h1>
          <p style={subtitle}>Configure registration limits, portal defaults, and maintenance options</p>
        </div>
      </div>

      <div style={panel}>
        <h2 style={panelTitle}>Platform Registrations &amp; Signups</h2>
        <div style={toggleRow}>
          <div style={toggleInfo}>
            <div style={toggleLabel}>Registration Flow</div>
            <p style={toggleDesc}>If deactivated, new freelancers cannot sign up or register accounts on the platform.</p>
          </div>
          <button onClick={() => handleToggle('registration_open')} style={toggleBtn}>
            {settings.registration_open ? (
              <ToggleRight size={40} color="#10B981" />
            ) : (
              <ToggleLeft size={40} color="#6B6860" />
            )}
          </button>
        </div>

        <div style={divider} />

        <div style={toggleRow}>
          <div style={toggleInfo}>
            <div style={toggleLabel}>Waitlist Queue</div>
            <p style={toggleDesc}>Route all new signups directly into the waitlist pool instead of granting instant trial access.</p>
          </div>
          <button onClick={() => handleToggle('waitlist_enabled')} style={toggleBtn}>
            {settings.waitlist_enabled ? (
              <ToggleRight size={40} color="#10B981" />
            ) : (
              <ToggleLeft size={40} color="#6B6860" />
            )}
          </button>
        </div>

        <div style={divider} />

        <div style={toggleRow}>
          <div style={toggleInfo}>
            <div style={toggleLabel}>Maintenance Mode</div>
            <p style={toggleDesc}>Toggles system-wide dashboard block to run database operations or migrations safely.</p>
          </div>
          <button onClick={() => handleToggle('maintenance_mode')} style={toggleBtn}>
            {settings.maintenance_mode ? (
              <ToggleRight size={40} color="#EF4444" />
            ) : (
              <ToggleLeft size={40} color="#6B6860" />
            )}
          </button>
        </div>

        <div style={divider} />

        <div style={inputGroup}>
          <label style={inputLabel}>Contact Support Email Address</label>
          <input
            type="email"
            value={settings.support_email}
            onChange={e => handleEmailChange(e.target.value)}
            style={textInput}
          />
          <p style={inputDesc}>System notifications and email default templates fallback address.</p>
        </div>

        <div style={actionRow}>
          {success && <span style={successMsg}>Configurations saved successfully!</span>}
          <button onClick={handleSave} disabled={saving} style={saveBtn}>
            {saving ? (
              <Loader2 size={16} style={{ animation: 'spin 0.8s linear' }} />
            ) : (
              <Save size={16} />
            )}
            <span>Save Configurations</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const loadingWrap: React.CSSProperties = {
  padding: '60px 0',
  textAlign: 'center',
  color: '#6B6860',
  fontSize: '14px',
};

const header: React.CSSProperties = {
  marginBottom: '32px',
};

const title: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: '#DEDAD5',
  margin: '0 0 4px',
  letterSpacing: '-0.5px',
};

const subtitle: React.CSSProperties = {
  fontSize: '14px',
  color: '#9E9B94',
  margin: 0,
};

const panel: React.CSSProperties = {
  background: '#1B1A18',
  border: '1px solid #2E2C29',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '680px',
};

const panelTitle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#DEDAD5',
  marginBottom: '24px',
};

const toggleRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
};

const toggleInfo: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  flex: 1,
};

const toggleLabel: React.CSSProperties = {
  fontSize: '14.5px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const toggleDesc: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#9E9B94',
  margin: 0,
  lineHeight: 1.45,
};

const toggleBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
};

const divider: React.CSSProperties = {
  height: '1px',
  background: '#232220',
  margin: '20px 0',
};

const inputGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px',
};

const inputLabel: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#DEDAD5',
};

const textInput: React.CSSProperties = {
  width: '100%',
  maxWidth: '320px',
  padding: '10px 14px',
  background: '#141413',
  border: '1px solid #2E2C29',
  borderRadius: '8px',
  color: '#DEDAD5',
  fontSize: '13.5px',
  outline: 'none',
  boxSizing: 'border-box',
};

const inputDesc: React.CSSProperties = {
  fontSize: '12px',
  color: '#6B6860',
  margin: 0,
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '16px',
  marginTop: '32px',
};

const successMsg: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#10B981',
};

const saveBtn: React.CSSProperties = {
  padding: '11px 20px',
  background: '#C9940F',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13.5px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(201, 148, 15, 0.2)',
};
export const keyframesStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = keyframesStyle;
  document.head.appendChild(style);
}
