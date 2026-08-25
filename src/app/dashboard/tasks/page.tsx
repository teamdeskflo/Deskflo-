'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Calendar, ClipboardList,
  ChevronDown, ChevronUp, CheckSquare, Square,
  Clock, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import { useUser } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────
type Priority = 'high' | 'medium' | 'low';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: 'today' | 'overdue' | 'upcoming' | null;
  priority?: Priority;
  project?: string;
  project_id?: string;
};

const PRIORITY_COLORS = {
  high: { bg: '#FEE2E2', color: '#EF4444' },
  medium: { bg: '#FEF3C7', color: '#F59E0B' },
  low: { bg: '#D1FAE5', color: '#10B981' },
};

// Helper to calculate frontend task dueDate category
const calculateDueDateCategory = (dueDateStr: string | null): 'today' | 'overdue' | 'upcoming' | null => {
  if (!dueDateStr) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  if (dueDateStr === todayStr) return 'today';
  if (dueDateStr < todayStr) return 'overdue';
  return 'upcoming';
};

// ── Add / Edit Modal ───────────────────────────────
function TaskModal({ task, onClose, onSave }: { task?: Task; onClose: () => void; onSave: (t: Record<string, any>) => void }) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: task?.title || '',
    type: task?.project_id ? 'project' : 'daily',
    project_id: task?.project_id || '',
    dueDate: task?.dueDate || 'today',
    priority: task?.priority || 'medium',
  });

  // Load projects list
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data.map(p => ({ id: p.id, name: p.name })));
          if (data.length > 0 && !formData.project_id) {
            setFormData(prev => ({ ...prev, project_id: data[0].id }));
          }
        }
      } catch (err) {
        console.error('Error loading projects for task modal:', err);
      }
    }
    loadProjects();
  }, [formData.project_id]);

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
                cursor: 'pointer'
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
                value={formData.project_id}
                onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                style={{
                  width: '100%', padding: '9px 12px', fontSize: '13.5px',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                  cursor: 'pointer'
                }}
              >
                {projects.length === 0 ? (
                  <option value="">No projects found (Add project first)</option>
                ) : (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Due Date Category
                </label>
                <select
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value as any })}
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: '13.5px',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    outline: 'none', color: 'var(--text-primary)', background: 'var(--card-bg)',
                    cursor: 'pointer'
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
                    cursor: 'pointer'
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
              
              const finalData: Record<string, any> = {
                title: formData.title,
                priority: formData.priority,
              };

              if (formData.type === 'project') {
                finalData.project_id = formData.project_id;
                finalData.due_date = null;
              } else {
                finalData.project_id = null;
                const todayStr = new Date().toISOString().split('T')[0];
                if (formData.dueDate === 'today') {
                  finalData.due_date = todayStr;
                } else if (formData.dueDate === 'overdue') {
                  // Backdate by 2 days
                  const d = new Date();
                  d.setDate(d.getDate() - 2);
                  finalData.due_date = d.toISOString().split('T')[0];
                } else {
                  // Postdate by 2 days
                  const d = new Date();
                  d.setDate(d.getDate() + 2);
                  finalData.due_date = d.toISOString().split('T')[0];
                }
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // ── Fetch Tasks ───────────────────────────────────────────
  async function loadTasks() {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (Array.isArray(data)) {
        const formatted = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          completed: t.is_completed,
          dueDate: calculateDueDateCategory(t.due_date),
          priority: t.priority as Priority,
          project: t.projects?.name || '',
          project_id: t.project_id || ''
        }));
        setTasks(formatted);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  // Extract Daily Tasks
  const dailyTasks = tasks.filter(t => !t.project_id);
  
  // Extract Project Checklists (Group by Project Name)
  const projectTasks = tasks.filter(t => t.project_id && t.project);
  const projects = Array.from(new Set(projectTasks.map(t => t.project as string)));
  
  // Project expand state
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Auto-expand new/loaded projects
  useEffect(() => {
    if (projects.length > 0 && expandedProjects.size === 0) {
      setExpandedProjects(new Set(projects));
    }
  }, [projects]);

  const toggleProject = (proj: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(proj)) next.delete(proj);
      else next.add(proj);
      return next;
    });
  };

  // ── Toggle complete state ─────────────────────────────────
  const toggleTaskComplete = async (taskItem: Task) => {
    try {
      const nextCompleted = !taskItem.completed;
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskItem.id ? { ...t, completed: nextCompleted } : t));

      const res = await fetch(`/api/tasks/${taskItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: nextCompleted }),
      });

      if (!res.ok) {
        // Revert
        setTasks(prev => prev.map(t => t.id === taskItem.id ? { ...t, completed: taskItem.completed } : t));
        alert('Failed to update task state.');
      }
    } catch (err) {
      console.error('Error toggling task completion:', err);
    }
  };

  // ── Save Task ─────────────────────────────────────────────
  const handleSaveTask = async (data: Record<string, any>) => {
    try {
      if (modal === 'edit' && editingTask) {
        // PUT
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            priority: data.priority,
            project_id: data.project_id || null,
            due_date: data.due_date || null
          }),
        });
        if (res.ok) loadTasks();
        else alert('Failed to update task.');
      } else {
        // POST
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            priority: data.priority,
            project_id: data.project_id || null,
            due_date: data.due_date || null
          }),
        });
        if (res.ok) loadTasks();
        else alert('Failed to create task.');
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
    setModal(null);
    setEditingTask(undefined);
  };

  // ── Delete Task ───────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          loadTasks();
        } else {
          alert('Failed to delete task.');
        }
      } catch (err) {
        console.error('Error deleting task:', err);
      }
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
          Welcome back, {user?.name ? user.name.split(' ')[0] : 'Freelancer'}!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {today}
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

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading your task checklists...
        </div>
      ) : tasks.length === 0 ? (
        /* Premium Blank Slate Empty State Illustration requested by User */
        <div style={{
          background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '60px 30px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', color: 'var(--text-muted)'
          }}>
            <CheckCircle2 size={26} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Manage your todo list and tasks easily from this page
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '440px', lineHeight: 1.5 }}>
            Add your tasks like this to stay fully organized! Keep track of urgent client revisions, contract updates, custom assets, or checklist stages to streamline your freelancing.
          </p>
          <button
            onClick={() => setModal('add')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 18px', borderRadius: 'var(--radius-md)',
              background: 'var(--text-primary)', color: 'var(--card-bg)',
              border: 'none', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Your First Task
          </button>
        </div>
      ) : (
        <>
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
            </div>

            {/* List */}
            <div>
              {dailyTasks.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                  No tasks for today! Click "Add Task" to record one.
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
                      <button onClick={() => toggleTaskComplete(task)} style={{
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
                        {task.dueDate === 'overdue' ? 'Overdue' : task.dueDate === 'today' ? 'Today' : 'Upcoming'}
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
                  No project checklists yet. Associate a task with a project to see checklists here!
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

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div style={{
                          padding: '8px 20px 20px 44px',
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px'
                        }}>
                          {pTasks.map(task => (
                            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                <button onClick={() => toggleTaskComplete(task)} style={{
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
                              </div>
                              
                              {/* Hover Actions (Edit/Delete) */}
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
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
        </>
      )}

    </div>
  );
}
