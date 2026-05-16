'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2,
  FolderOpen, BarChart2, ChevronDown,
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  activeProjects: number;
  completedProjects: number;
  totalEarned: number;
};

// ── Mock data ──
const INITIAL_CLIENTS: Client[] = [
  { id: 1, name: 'Rahul Sharma',   email: 'rahul@web.com',     phone: '+91 98765 43210', company: 'WebCraft Studio',   activeProjects: 3, completedProjects: 1, totalEarned: 45000  },
  { id: 2, name: 'Priya Patel',    email: 'priya@social.com',  phone: '+91 87654 32109', company: 'Social Bee Agency', activeProjects: 2, completedProjects: 0, totalEarned: 22000  },
  { id: 3, name: 'Vikram Singh',   email: 'vikram@video.com',  phone: '+91 76543 21098', company: 'FrameFactory',      activeProjects: 1, completedProjects: 2, totalEarned: 38500  },
  { id: 4, name: 'ClientX Agency', email: 'clientx@xyz.com',   phone: '+91 65432 10987', company: 'ClientX Pvt Ltd',  activeProjects: 0, completedProjects: 0, totalEarned: 0      },
  { id: 5, name: 'Neha Kapoor',    email: 'neha@brand.in',     phone: '+91 99887 76655', company: 'Neha Branding',     activeProjects: 2, completedProjects: 3, totalEarned: 61000  },
  { id: 6, name: 'Arjun Mehta',    email: 'arjun@ecomm.in',    phone: '+91 88776 65544', company: 'Arjun eComm',       activeProjects: 1, completedProjects: 1, totalEarned: 18000  },
];

type FilterType = 'all' | 'active' | 'inactive';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ['#D4A017', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

// ── Add / Edit Modal ───────────────────────────────
function ClientModal({ client, onClose, onSave }: { client?: Client; onClose: () => void; onSave: (client: Partial<Client>) => void }) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          padding: '28px', width: '100%', maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          {client ? 'Edit Client' : 'Add New Client'}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'Full Name', field: 'name', placeholder: 'e.g. Rahul Sharma' },
            { label: 'Email', field: 'email', placeholder: 'e.g. rahul@web.com' },
            { label: 'Phone', field: 'phone', placeholder: 'e.g. +91 98765 43210' },
            { label: 'Company Name', field: 'company', placeholder: 'e.g. WebCraft Studio (optional)' },
          ].map(({ label, field, placeholder }) => (
            <div key={label}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                {label}
              </label>
              <input
                value={(formData as any)[field]}
                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={placeholder}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '22px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.name || !formData.email) return alert('Name and email are required');
              onSave(formData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--text-primary)', color: 'var(--card-bg)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >{client ? 'Save Changes' : 'Add Client'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function ClientsPage() {
  const user = useUser();
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  const filtered = clients.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? c.activeProjects > 0 :
      c.activeProjects === 0;
    return matchSearch && matchFilter;
  });

  const totalEarned = clients.reduce((s, c) => s + c.totalEarned, 0);
  const totalActive = clients.reduce((s, c) => s + c.activeProjects, 0);

  const handleSaveClient = (data: Partial<Client>) => {
    if (modal === 'edit' && editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...data } as Client : c));
    } else {
      setClients([...clients, { ...data, id: Date.now(), activeProjects: 0, completedProjects: 0, totalEarned: 0 } as Client]);
    }
    setModal(null);
    setEditingClient(undefined);
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  return (
    <>
      {/* Modal */}
      {modal && (
        <ClientModal
          client={modal === 'edit' ? editingClient : undefined}
          onClose={() => { setModal(null); setEditingClient(undefined); }}
          onSave={handleSaveClient}
        />
      )}

      <div style={{ maxWidth: '1100px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '22px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
            Welcome back, {user.name.split(' ')[0]}!
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{today}</p>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
            Clients
          </h1>
          <button
            onClick={() => setModal('add')}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '10px 18px', borderRadius: 'var(--radius-md)',
              background: 'var(--text-primary)', color: 'var(--card-bg)',
              border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Client
          </button>
        </div>

        {/* Main card */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          marginBottom: '16px', overflow: 'hidden',
        }}>
          {/* Search + filter bar */}
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', gap: '10px', alignItems: 'center',
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={15} strokeWidth={1.8} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients..."
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px', color: 'var(--text-primary)', outline: 'none',
                  background: 'var(--content-bg)',
                }}
              />
            </div>

            {/* Filter dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFilterMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 14px', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', background: 'var(--card-bg)',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
                }}
              >
                <SlidersHorizontal size={14} strokeWidth={1.8} />
                Filter
                <ChevronDown size={13} strokeWidth={2} />
              </button>
              {showFilterMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '42px', zIndex: 10,
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                  minWidth: '140px', overflow: 'hidden',
                }}>
                  {(['all', 'active', 'inactive'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setShowFilterMenu(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 14px', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: filter === f ? 600 : 400,
                        background: filter === f ? 'var(--content-bg)' : 'var(--card-bg)',
                        color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {f === 'all' ? 'All Clients' : f === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr',
            padding: '10px 20px', background: 'var(--content-bg)',
            borderBottom: '1px solid var(--border)',
          }}>
            {['Client Name', 'Contact Info', 'Projects', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No clients found.
            </div>
          ) : (
            filtered.map((client, i) => (
              <div
                key={client.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr',
                  padding: '14px 20px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', color: 'white', flexShrink: 0,
                  }}>
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13.5px', margin: '0 0 2px', color: 'var(--text-primary)' }}>{client.name}</p>
                    {client.company && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>{client.company}</p>}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <p style={{ fontSize: '13px', margin: '0 0 2px', color: 'var(--text-secondary)' }}>{client.email}</p>
                  <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-muted)' }}>{client.phone}</p>
                </div>

                {/* Projects */}
                <div>
                  <p style={{ fontSize: '13px', margin: '0 0 2px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{client.activeProjects}</span> active
                  </p>
                  <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-muted)' }}>
                    {client.completedProjects} complete
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {/* Edit */}
                  <button
                    onClick={() => { setEditingClient(client); setModal('edit'); }}
                    title="Edit client"
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Pencil size={13} strokeWidth={1.8} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    title="Delete client"
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid #FECACA', background: '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--error)',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>

                  {/* Files */}
                  <Link
                    href={`/dashboard/files?client=${client.id}`}
                    title="View files"
                    style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <FolderOpen size={13} strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
            ))
          )}

          {/* Count */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border)',
            fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center',
          }}>
            Showing {filtered.length} of {clients.length} clients
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '14px 22px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <BarChart2 size={16} strokeWidth={1.8} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>Quick Stats</span>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
            Total Clients: <strong>{clients.length}</strong>
          </span>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
            Active Projects: <strong>{totalActive}</strong>
          </span>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 8px' }} />
          <span style={{ fontSize: '13.5px', color: 'var(--accent)', fontWeight: 700 }}>
            ₹{totalEarned.toLocaleString('en-IN')} earned
          </span>
        </div>
      </div>
    </>
  );
}
