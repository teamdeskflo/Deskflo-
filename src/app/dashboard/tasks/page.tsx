'use client';

import { useState } from 'react';
import {
  Plus, Pencil, Trash2, Calendar, ClipboardList,
  ChevronDown, ChevronUp, CheckSquare, Square,
  Clock, AlertCircle, FileText
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type Priority = 'high' | 'medium' | 'low';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  dueDate: 'today' | 'overdue' | 'upcoming' | null;
  priority?: Priority; // For mobile view in design
  project?: string;    // If it belongs to a project checklist
};

// ── Mock data ──
const INITIAL_TASKS: Task[] = [
  // Today's Tasks
  { id: 1, title: 'Send final logo to Rahul Sharma', completed: false, dueDate: 'today', priority: 'high' },
  { id: 2, title: 'Call Priya for feedback on website', completed: false, dueDate: 'today', priority: 'medium' },
  { id: 3, title: 'Create invoice for Vikram Singh', completed: false, dueDate: 'today', priority: 'low' },
  { id: 4, title: 'Follow up with ClientX for payment', completed: false, dueDate: 'overdue', priority: 'high' },
  
  // Project Checklists
  { id: 5, title: 'Share wireframes', completed: false, dueDate: null, project: 'Website Redesign (Rahul Sharma)' },
  { id: 6, title: 'Develop homepage', completed: false, dueDate: null, project: 'Website Redesign (Rahul Sharma)' },
  { id: 7, title: 'Get approval on design', completed: false, dueDate: null, project: 'Website Redesign (Rahul Sharma)' },
  { id: 8, title: 'Client review', completed: false, dueDate: null, project: 'Website Redesign (Rahul Sharma)' },
  { id: 9, title: 'Send final files', completed: true, dueDate: null, project: 'Website Redesign (Rahul Sharma)' },

  { id: 10, title: 'Create 10 Instagram posts', completed: false, dueDate: null, project: 'Social Media Kit (Vikram Singh)' },
  { id: 11, title: 'Revisions', completed: false, dueDate: null, project: 'Social Media Kit (Vikram Singh)' },
  { id: 12, title: 'Client feedback', completed: false, dueDate: null, project: 'Social Media Kit (Vikram Singh)' },
  { id: 13, title: 'Final delivery', completed: false, dueDate: null, project: 'Social Media Kit (Vikram Singh)' },
];

const PRIORITY_COLORS = {
  high: { bg: '#FEE2E2', color: '#EF4444' },
  medium: { bg: '#FEF3C7', color: '#F59E0B' },
  low: { bg: '#D1FAE5', color: '#10B981' },
};

// ── Add / Edit Modal ───────────────────────────────
function TaskModal({ task, onClose, onSave }: { task?: Task; onClose: () => void; onSave: (t: Partial<Task>) => void }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    type: task?.project ? 'project' : 'daily',
    project: task?.project || 'Website Redesign (Rahul Sharma)',
    dueDate: task?.dueDate || 'today',
    priority: task?.priority || 'medium',
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
          padding: '28px', width: '100%', maxWidth: '440px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary)' }}>
          {task ? 'Edit Task' : 'Add New Task'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Title */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Task Title
            </label>
            <input
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Call client for feedback"
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
              }}
            />
          </div>

          {/* Type Selection */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
              Task Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '13.5px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                appearance: 'none', cursor: 'pointer'
              }}
            >
              <option value="daily">Daily Task (Today / Overdue)</option>
              <option value="project">Project Checklist Item</option>
            </select>
          </div>

          {/* Conditional Fields based on Type */}
          {formData.type === 'project' ? (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                Select Project
              </label>
              <select
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                  appearance: 'none', cursor: 'pointer'
                }}
              >
                <option value="Website Redesign (Rahul Sharma)">Website Redesign (Rahul Sharma)</option>
                <option value="Social Media Kit (Vikram Singh)">Social Media Kit (Vikram Singh)</option>
                <option value="Brand Guidelines (Priya Patel)">Brand Guidelines (Priya Patel)</option>
              </select>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Due Date
                </label>
                <select
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value as any })}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                    appearance: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="today">Today</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                    appearance: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '9px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button 
            onClick={() => {
              if (!formData.title) return alert('Task title is required');
              
              const finalData: Partial<Task> = { title: formData.title };
              if (formData.type === 'project') {
                finalData.project = formData.project;
                finalData.dueDate = null;
              } else {
                finalData.dueDate = formData.dueDate as any;
                finalData.priority = formData.priority as any;
                finalData.project = undefined;
              }
              
              onSave(finalData);
            }}
            style={{
              padding: '9px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >{task ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────
export default function TasksPage() {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  // Extract Daily Tasks
  const dailyTasks = tasks.filter(t => !t.project);
  
  // Extract Project Checklists (Group by Project)
  const projectTasks = tasks.filter(t => t.project);
  const projects = Array.from(new Set(projectTasks.map(t => t.project as string)));
  
  // Project expand state
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(projects));

  const toggleProject = (proj: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(proj)) next.delete(proj);
      else next.add(proj);
      return next;
    });
  };

  const toggleTaskComplete = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSaveTask = (data: Partial<Task>) => {
    if (modal === 'edit' && editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...data } as Task : t));
    } else {
      setTasks([...tasks, { ...data, id: Date.now(), completed: false } as Task]);
      if (data.project) {
        setExpandedProjects(prev => new Set(prev).add(data.project!));
      }
    }
    setModal(null);
    setEditingTask(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '1100px' }}>
      
      {/* Modal */}
      {modal && (
        <TaskModal
          task={modal === 'edit' ? editingTask : undefined}
          onClose={() => { setModal(null); setEditingTask(undefined); }}
          onSave={handleSaveTask}
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
          Tasks
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
          Add Task
        </button>
      </div>

      {/* SECTION 1: Today's Tasks */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: 'var(--content-bg)', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> Today's Tasks
          </h2>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'transparent', border: '1px solid var(--border)',
            padding: '6px 10px', borderRadius: 'var(--radius-sm)',
            fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            View: All <ChevronDown size={13} strokeWidth={2.5} />
          </button>
        </div>

        {/* List */}
        <div>
          {dailyTasks.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              No tasks for today!
            </div>
          ) : (
            dailyTasks.map((task, i) => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: i < dailyTasks.length - 1 ? '1px solid var(--border-light)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--content-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Checkbox & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <button onClick={() => toggleTaskComplete(task.id)} style={{
                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                    color: task.completed ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex'
                  }}>
                    {task.completed ? <CheckSquare size={18} strokeWidth={2.5} /> : <Square size={18} strokeWidth={2} />}
                  </button>
                  <span style={{
                    fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1,
                  }}>
                    {task.title}
                  </span>
                </div>

                {/* Due Date & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                    color: task.dueDate === 'overdue' ? 'var(--error)' : 'var(--text-secondary)'
                  }}>
                    {task.dueDate === 'overdue' ? <AlertCircle size={14} /> : <Calendar size={14} />}
                    {task.dueDate === 'overdue' ? 'Overdue' : 'Today'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      title="Edit task"
                      onClick={() => { setEditingTask(task); setModal('edit'); }}
                      style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Pencil size={14} strokeWidth={1.8} />
                    </button>
                    <button
                      title="Delete task"
                      onClick={() => handleDelete(task.id)}
                      style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = 'var(--error)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: Project Checklists */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        marginBottom: '24px', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', background: 'var(--content-bg)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} /> Project Checklists
          </h2>
        </div>

        {/* Projects List */}
        <div>
          {projects.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              No project checklists yet.
            </div>
          ) : (
            projects.map((proj, idx) => {
              const isExpanded = expandedProjects.has(proj);
              const pTasks = projectTasks.filter(t => t.project === proj);

              return (
                <div key={proj} style={{ borderBottom: idx < projects.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleProject(proj)}
                    style={{
                      width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px',
                      background: isExpanded ? 'var(--card-bg)' : 'var(--content-bg)', border: 'none',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
                    onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'var(--content-bg)')}
                  >
                    <span style={{ color: 'var(--text-primary)' }}>
                      {isExpanded ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronUp size={16} strokeWidth={2.5} />}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {proj}
                    </span>
                  </button>

                  {/* Accordion Body (Grid of tasks) */}
                  {isExpanded && (
                    <div style={{
                      padding: '8px 20px 20px 44px',
                      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px'
                    }}>
                      {pTasks.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => toggleTaskComplete(task.id)} style={{
                            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                            color: task.completed ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex',
                            flexShrink: 0
                          }}>
                            {task.completed ? <CheckSquare size={16} strokeWidth={2.5} /> : <Square size={16} strokeWidth={2} />}
                          </button>
                          <span style={{
                            fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.6 : 1,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {task.title}
                          </span>
                          
                          {/* Hover Actions (Edit/Delete) */}
                          <div className="task-actions" style={{ display: 'flex', gap: '4px', opacity: 0.6, transition: 'opacity 0.2s' }}>
                            <button
                              onClick={() => { setEditingTask(task); setModal('edit'); }}
                              style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              <Trash2 size={12} />
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
