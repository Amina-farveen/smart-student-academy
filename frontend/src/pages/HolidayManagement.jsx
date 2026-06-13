import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { holidayAPI } from '../services/api';
import './HolidayManagement.css';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ holidayDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try {
      const { data } = await holidayAPI.getAll();
      setHolidays(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.holidayDate || !form.reason.trim()) {
      setError('Both date and reason are required');
      return;
    }
    setSaving(true);
    try {
      await holidayAPI.add(form);
      setShowModal(false);
      setForm({ holidayDate: '', reason: '' });
      setSuccess('Holiday added successfully');
      fetchHolidays();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await holidayAPI.delete(id);
      setHolidays(prev => prev.filter(h => h._id !== id));
      setDeleteId(null);
      setSuccess('Holiday removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
  };

  const isToday = (date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(date); d.setHours(0,0,0,0);
    return today.getTime() === d.getTime();
  };

  const isPast = (date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(date); d.setHours(0,0,0,0);
    return d < today;
  };

  const upcoming = holidays.filter(h => !isPast(h.holidayDate) || isToday(h.holidayDate));
  const past = holidays.filter(h => isPast(h.holidayDate) && !isToday(h.holidayDate));

  if (loading) return <Layout pageTitle="Holiday Management"><Loader /></Layout>;

  return (
    <Layout pageTitle="Holiday Management">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Holiday Management</h1>
          <p className="page-subtitle">Mark holidays so they don't consume a day order</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>+ Add Holiday</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="holiday-stats">
        <div className="holiday-stat-card">
          <div className="hstat-value">{holidays.length}</div>
          <div className="hstat-label">Total Holidays</div>
        </div>
        <div className="holiday-stat-card">
          <div className="hstat-value" style={{ color: 'var(--emerald-400)' }}>{upcoming.length}</div>
          <div className="hstat-label">Upcoming</div>
        </div>
        <div className="holiday-stat-card">
          <div className="hstat-value" style={{ color: 'var(--text-muted)' }}>{past.length}</div>
          <div className="hstat-label">Past</div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="section-title" style={{ marginBottom: '16px' }}>
          Upcoming & Today
          <span className="badge badge-emerald" style={{ marginLeft: '10px' }}>{upcoming.length}</span>
        </h3>
        {upcoming.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <div className="empty-state-icon">◈</div>
            <h3>No upcoming holidays</h3>
            <p>Add holidays to prevent day order progression on those days</p>
          </div>
        ) : (
          <div className="holidays-list">
            {upcoming.sort((a,b) => new Date(a.holidayDate) - new Date(b.holidayDate)).map(h => (
              <div key={h._id} className={`holiday-item ${isToday(h.holidayDate) ? 'holiday-item--today' : ''}`}>
                <div className="holiday-item-icon">◈</div>
                <div className="holiday-item-info">
                  <div className="holiday-item-date">
                    {new Date(h.holidayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {isToday(h.holidayDate) && <span className="badge badge-rose" style={{ marginLeft: '8px' }}>Today</span>}
                  </div>
                  <div className="holiday-item-reason">{h.reason}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(h._id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Holidays */}
      {past.length > 0 && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Past Holidays
            <span className="badge" style={{ marginLeft: '10px', background: 'var(--surface-4)', color: 'var(--text-muted)' }}>{past.length}</span>
          </h3>
          <div className="holidays-list">
            {past.sort((a,b) => new Date(b.holidayDate) - new Date(a.holidayDate)).map(h => (
              <div key={h._id} className="holiday-item holiday-item--past">
                <div className="holiday-item-icon" style={{ opacity: 0.4 }}>◈</div>
                <div className="holiday-item-info">
                  <div className="holiday-item-date" style={{ color: 'var(--text-muted)' }}>
                    {new Date(h.holidayDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="holiday-item-reason" style={{ color: 'var(--text-muted)' }}>{h.reason}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(h._id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Holiday</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Holiday Date <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="date" name="holidayDate" className="form-control" value={form.holidayDate} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Reason <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="text" name="reason" className="form-control" placeholder="e.g. National Holiday, College Event" value={form.reason} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Remove Holiday</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Remove this holiday? The day will be treated as a working day again.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HolidayManagement;
