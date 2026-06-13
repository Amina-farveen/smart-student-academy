import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { todoAPI } from '../services/api';
import './Todo.css';

const EMPTY_FORM = { title: '', description: '', dueDate: '', priority: 'medium', type: 'task' };

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const { data } = await todoAPI.getAll();
      setTodos(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const openAdd = (defaultType = 'task') => {
    setForm({ ...EMPTY_FORM, type: defaultType });
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (todo) => {
    setForm({
      title: todo.title,
      description: todo.description || '',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      priority: todo.priority,
      type: todo.type
    });
    setEditId(todo._id);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.dueDate) { setError('Title and due date are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await todoAPI.update(editId, form);
        setTodos(prev => prev.map(t => t._id === editId ? data.data : t));
      } else {
        const { data } = await todoAPI.add(form);
        setTodos(prev => [data.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await todoAPI.toggle(id);
      setTodos(prev => prev.map(t => t._id === id ? data.data : t));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await todoAPI.delete(id);
      setTodos(prev => prev.filter(t => t._id !== id));
      setDeleteId(null);
    } catch {}
  };

  const filtered = todos.filter(t => {
    const typeMatch = filterType === 'all' || t.type === filterType;
    const statusMatch = filterStatus === 'all' || (filterStatus === 'pending' && !t.completed) || (filterStatus === 'completed' && t.completed);
    return typeMatch && statusMatch;
  });

  const today = new Date(); today.setHours(0,0,0,0);

  const isOverdue = (todo) => {
    if (todo.completed) return false;
    const due = new Date(todo.dueDate); due.setHours(0,0,0,0);
    return due < today;
  };

  const isDueToday = (todo) => {
    if (todo.completed) return false;
    const due = new Date(todo.dueDate); due.setHours(0,0,0,0);
    return due.getTime() === today.getTime();
  };

  const pending = todos.filter(t => !t.completed).length;
  const overdue = todos.filter(isOverdue).length;
  const completed = todos.filter(t => t.completed).length;

  if (loading) return <Layout pageTitle="Tasks & Assignments"><Loader /></Layout>;

  return (
    <Layout pageTitle="Tasks & Assignments">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Tasks & Assignments</h1>
          <p className="page-subtitle">Track your todos, assignments and deadlines</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={() => openAdd('assignment')}>+ Assignment</button>
          <button className="btn btn-primary" onClick={() => openAdd('task')}>+ Task</button>
        </div>
      </div>

      {/* Stats */}
      <div className="todo-stats">
        <div className="tstat tstat--pending">
          <span className="tstat-val">{pending}</span>
          <span className="tstat-lbl">Pending</span>
        </div>
        <div className="tstat tstat--overdue">
          <span className="tstat-val">{overdue}</span>
          <span className="tstat-lbl">Overdue</span>
        </div>
        <div className="tstat tstat--done">
          <span className="tstat-val">{completed}</span>
          <span className="tstat-lbl">Completed</span>
        </div>
        <div className="tstat">
          <span className="tstat-val">{todos.length}</span>
          <span className="tstat-lbl">Total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="todo-filters">
        <div className="filter-group">
          {['all', 'task', 'assignment'].map(t => (
            <button key={t} className={`filter-chip ${filterType === t ? 'filter-chip--active' : ''}`} onClick={() => setFilterType(t)}>
              {t === 'all' ? 'All Types' : t === 'task' ? 'Tasks' : 'Assignments'}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {['all', 'pending', 'completed'].map(s => (
            <button key={s} className={`filter-chip ${filterStatus === s ? 'filter-chip--active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Todo List */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◻</div>
            <h3>No tasks found</h3>
            <p>Add a task or assignment to get started</p>
          </div>
        </div>
      ) : (
        <div className="todo-list">
          {filtered.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          }).map(todo => (
            <div
              key={todo._id}
              className={`todo-item ${todo.completed ? 'todo-item--done' : ''} ${isOverdue(todo) ? 'todo-item--overdue' : ''} ${isDueToday(todo) ? 'todo-item--today' : ''}`}
            >
              <button className={`todo-check ${todo.completed ? 'todo-check--checked' : ''}`} onClick={() => handleToggle(todo._id)}>
                {todo.completed && '✓'}
              </button>
              <div className="todo-content">
                <div className="todo-top">
                  <span className="todo-title">{todo.title}</span>
                  <div className="todo-badges">
                    <span className={`badge ${todo.type === 'assignment' ? 'badge-violet' : 'badge-cyan'}`}>
                      {todo.type}
                    </span>
                    <span className={`badge ${todo.priority === 'high' ? 'badge-rose' : todo.priority === 'medium' ? 'badge-amber' : 'badge-emerald'}`}>
                      {todo.priority}
                    </span>
                    {isOverdue(todo) && <span className="badge badge-rose">Overdue</span>}
                    {isDueToday(todo) && <span className="badge badge-amber">Due Today</span>}
                  </div>
                </div>
                {todo.description && <p className="todo-desc">{todo.description}</p>}
                <div className="todo-due">
                  Due: {new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="todo-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(todo)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(todo._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Task' : form.type === 'assignment' ? 'New Assignment' : 'New Task'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="text" name="title" className="form-control" placeholder="Task title" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="2" placeholder="Optional details" value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Due Date <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                  <input type="date" name="dueDate" className="form-control" value={form.dueDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" className="form-control" value={form.priority} onChange={handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Type</label>
                <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                  <option value="task">Task</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Task</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Delete this task permanently?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Todo;
