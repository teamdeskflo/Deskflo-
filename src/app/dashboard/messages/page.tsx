'use client';

import { useState } from 'react';
import {
  Search, Plus, Pencil, Trash2, Copy, Check,
  ChevronDown, ChevronUp, FolderOpen, AlertCircle,
  BarChart2, Clock, CheckCircle2, MessageSquare, CreditCard,
  Phone, Users, Briefcase
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';
import { INITIAL_MESSAGES, MessageTemplate, MessageCategory } from '@/data/messages';

// Icons mapping for categories
const CATEGORY_ICONS: Record<string, any> = {
  'Initial Client Communication': Users,
  'File Sharing & Sending': FolderOpen,
  'Approval Requests & Reminders': AlertCircle,
  'Project Status Updates': BarChart2,
  'Invoices & Payments': CreditCard,
  'Post-Project & Follow-ups': CheckCircle2,
  'Client Questions & Objections': MessageSquare,
  'Payment Confirmation & Follow-up': Clock,
  'WhatsApp Link Generation': Phone,
  'Context-Specific Professional Notes': Briefcase,
  'End of Discussion & Closing': CheckSquareIconMock,
  'My Custom Messages': MessageSquare
};

function CheckSquareIconMock(props: any) {
  return <CheckCircle2 {...props} />;
}

// ── Copy Button ──
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '6px 12px', borderRadius: 'var(--radius-sm)',
        background: 'var(--content-bg)', border: '1px solid var(--border)',
        fontSize: '12px', fontWeight: 600, color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => !copied && (e.currentTarget.style.borderColor = 'var(--text-primary)', e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => !copied && (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.color = 'var(--text-secondary)')}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Modal ──
function MessageModal({ msg, onClose, onSave }: { msg?: MessageTemplate; onClose: () => void; onSave: (data: Partial<MessageTemplate>) => void }) {
  const [formData, setFormData] = useState({
    title: msg?.title || '',
    category: msg?.category || 'My Custom Messages',
    content: msg?.content || '',
  });

  const categories: MessageCategory[] = [
    'Initial Client Communication', 'File Sharing & Sending', 'Approval Requests & Reminders',
    'Project Status Updates', 'Invoices & Payments', 'Post-Project & Follow-ups',
    'Client Questions & Objections', 'Payment Confirmation & Follow-up', 'WhatsApp Link Generation',
    'Context-Specific Professional Notes', 'End of Discussion & Closing', 'My Custom Messages'
  ];

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
          padding: '28px', width: '100%', maxWidth: '500px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          {msg ? 'Edit Message' : 'Add Custom Message'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Message Title
            </label>
            <input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Welcome Client"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as MessageCategory })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Message Content (Use {`{variables}`} for placeholders)
            </label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="Hi {client_name}, here is your file..."
              rows={6}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                resize: 'none', fontFamily: 'inherit', lineHeight: 1.5
              }}
            />
          </div>

        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.title || !formData.content) return alert('Title and content are required');
              onSave(formData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >{msg ? 'Save Changes' : 'Save Message'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function MessagesPage() {
  const user = useUser();
  const [messages, setMessages] = useState<MessageTemplate[]>(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingMsg, setEditingMsg] = useState<MessageTemplate | undefined>();

  const filtered = messages.filter(m => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' ? true : m.category === filterCategory;
    return matchSearch && matchCat;
  });

  // Group by category
  const categories = Array.from(new Set(filtered.map(m => m.category)));
  
  // Collapse state (default all open if searching, otherwise open specific ones)
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSave = (data: Partial<MessageTemplate>) => {
    if (modal === 'edit' && editingMsg) {
      setMessages(messages.map(m => m.id === editingMsg.id ? { ...m, ...data } as MessageTemplate : m));
    } else {
      setMessages([{ ...data, id: `c-${Date.now()}` } as MessageTemplate, ...messages]);
    }
    setModal(null);
    setEditingMsg(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this message template?')) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Modal */}
      {modal && (
        <MessageModal
          msg={modal === 'edit' ? editingMsg : undefined}
          onClose={() => { setModal(null); setEditingMsg(undefined); }}
          onSave={handleSave}
        />
      )}

      {/* Page header */}
      <div style={{ marginBottom: '22px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 2px' }}>
          Welcome back, {user.name.split(' ')[0]}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          Messages Library
        </h1>
        <button
          onClick={() => setModal('add')}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '10px 18px', borderRadius: 'var(--radius-md)',
            background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)',
            border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Message
        </button>
      </div>

      {/* Main Container */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '40px', overflow: 'hidden',
      }}>
        {/* Search bar */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--content-bg)'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} strokeWidth={1.8} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages..."
              style={{
                width: '100%', padding: '9px 12px 9px 36px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: '13.5px', color: 'var(--text-primary)', outline: 'none',
                background: 'var(--card-bg)',
              }}
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{
              padding: '9px 14px', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', background: 'var(--card-bg)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: 'var(--text-secondary)',
              outline: 'none'
            }}
          >
            <option value="All">Category: All</option>
            {Array.from(new Set(messages.map(m => m.category))).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div>
          {categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No messages found. Try a different search.
            </div>
          ) : (
            categories.map((cat, idx) => {
              const catMessages = filtered.filter(m => m.category === cat);
              const isCollapsed = collapsedCats.has(cat);
              const Icon = CATEGORY_ICONS[cat] || MessageSquare;

              return (
                <div key={cat} style={{ borderBottom: idx < categories.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    style={{
                      width: '100%', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'var(--content-bg)', border: 'none', borderBottom: isCollapsed ? 'none' : '1px solid var(--border-light)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <Icon size={16} color="var(--accent-dark)" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {cat} ({catMessages.length})
                    </span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </span>
                  </button>

                  {/* Messages Grid */}
                  {!isCollapsed && (
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {catMessages.map(msg => (
                        <div key={msg.id} style={{
                          background: 'var(--card-bg)', border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-md)', padding: '16px',
                          display: 'flex', flexDirection: 'column', gap: '10px'
                        }}>
                          {/* Title */}
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {msg.title}
                          </div>

                          {/* Content */}
                          <div style={{ 
                            fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6,
                            whiteSpace: 'pre-wrap', background: 'var(--card-bg)', padding: '12px',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
                            fontFamily: 'monospace' // Given they are templates, monospace looks nice
                          }}>
                            {msg.content}
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                            <CopyButton content={msg.content} />
                            
                            <button
                              title="Edit"
                              onClick={() => { setEditingMsg(msg); setModal('edit'); }}
                              style={{
                                width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)', background: 'var(--card-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              <Pencil size={13} strokeWidth={1.8} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => handleDelete(msg.id)}
                              style={{
                                width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
                                border: '1px solid #FECACA', background: '#FEF2F2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--error)', transition: 'all 0.12s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                            >
                              <Trash2 size={13} strokeWidth={1.8} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
