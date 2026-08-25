'use client';

import { useState } from 'react';
import { Download, AlertTriangle, Trash2, X } from 'lucide-react';

export default function SettingsDataPrivacyPage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Simulated dynamic counts (would come from backend)
  const [counts] = useState({
    clients: 12,
    projects: 24,
    files: 156,
    invoices: 23,
  });

  const handleDownloadAll = () => {
    window.location.href = '/api/export';
  };

  const confirmDelete = () => {
    if (deleteConfirm === 'DELETE') {
      alert("Account permanently deleted. Redirecting to home page...");
      window.location.href = '/';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Title */}
      <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.5px' }}>
        Settings - Data & Privacy
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
          <Download size={20} color="#3B82F6" strokeWidth={2.5} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
            DATA & PRIVACY
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Export Your Data */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Export Your Data
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 12px', fontWeight: 500 }}>
              Download everything you've created on Deskflo:
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
              <li>All clients (names, emails, phone numbers)</li>
              <li>All projects and status</li>
              <li>All files (original uploads)</li>
              <li>All invoices and payment records</li>
              <li>All approval logs (timestamp + IP)</li>
              <li>All activity logs</li>
            </ul>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 16px', fontWeight: 500 }}>
              Format: ZIP file with CSV + folders
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleDownloadAll} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--border-light)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Download size={16} color="#3B82F6" strokeWidth={2.5} />
                Download All Data
              </button>
            </div>
          </div>

          {/* Account Deletion */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Account Deletion
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#EAB308" />
              Permanently delete your account and all associated data.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              This action <strong>CANNOT</strong> be undone. You will lose:
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
              <li>All clients</li>
              <li>All projects</li>
              <li>All files</li>
              <li>All invoices</li>
              <li>All approval history</li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => { setDeleteConfirm(''); setIsDeleteModalOpen(true); }} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--error)',
                background: 'var(--error-light)', color: 'var(--error)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Trash2 size={16} />
                Delete Account Permanently
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '480px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--error)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--error)' }}>DELETE ACCOUNT</h3>
              </div>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                This action is permanent and cannot be undone.
              </p>
              
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'var(--text-secondary)' }}>You will lose:</p>
              <ul style={{ margin: '0 0 24px', paddingLeft: '20px', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6 }}>
                <li>All clients ({counts.clients})</li>
                <li>All projects ({counts.projects})</li>
                <li>All files ({counts.files})</li>
                <li>All invoices ({counts.invoices})</li>
                <li>All approval logs</li>
              </ul>
              
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Type "DELETE" to confirm:
              </label>
              <input 
                type="text" 
                value={deleteConfirm} 
                onChange={e => setDeleteConfirm(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  background: 'var(--content-bg)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                  marginBottom: '24px', fontFamily: 'monospace', letterSpacing: '1px'
                }}
                autoFocus
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setIsDeleteModalOpen(false)} style={{ 
                  padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', 
                  background: 'transparent', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' 
                }}>
                  Cancel
                </button>
                <button 
                  disabled={deleteConfirm !== 'DELETE'}
                  onClick={confirmDelete} 
                  style={{ 
                    padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: 'none', 
                    background: deleteConfirm === 'DELETE' ? 'var(--error)' : 'var(--error-light)', 
                    color: deleteConfirm === 'DELETE' ? 'white' : 'var(--error)', 
                    fontSize: '13px', fontWeight: 600, 
                    cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', opacity: deleteConfirm === 'DELETE' ? 1 : 0.5
                  }}>
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
