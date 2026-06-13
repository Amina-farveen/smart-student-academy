import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { timetableAPI } from '../services/api';
import './ManageTimetable.css';

const EMPTY_FORM = { dayOrder: '', period: '', subject: '', faculty: '', roomNo: '', startTime: '', endTime: '' };

const ManageTimetable = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig]           = useState(null);
const [showConfig, setShowConfig]   = useState(false);
const [configForm, setConfigForm]   = useState({
  semesterStartDate: '',
  startingDayOrder: '1',
  skipSaturday: true,
  skipSunday: true,
  totalDayOrders: '6'
});
const [savingConfig, setSavingConfig] = useState(false);
const [configMsg, setConfigMsg]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
  try {
    const [ttRes, cfgRes] = await Promise.all([
      timetableAPI.getAll(),
      timetableAPI.getConfig()
    ]);
    setEntries(ttRes.data.data);
    if (cfgRes.data.data) {
      setConfig(cfgRes.data.data);
      setConfigForm({
        semesterStartDate: cfgRes.data.data.semesterStartDate
          ? cfgRes.data.data.semesterStartDate.split('T')[0]
          : '',
        startingDayOrder: String(cfgRes.data.data.startingDayOrder || 1),
        skipSaturday: cfgRes.data.data.skipSaturday !== false,
        skipSunday:   cfgRes.data.data.skipSunday !== false,
        totalDayOrders: String(cfgRes.data.data.totalDayOrders || 6)
      });
    }
  } catch {}
  finally { setLoading(false); }
};
const handleSaveConfig = async (e) => {
  e.preventDefault();
  setSavingConfig(true);
  setConfigMsg('');
  try {
    await timetableAPI.saveConfig(configForm);
    setConfigMsg('Semester configuration saved. Day orders now calculate automatically.');
    setShowConfig(false);
    fetchEntries();
  } catch (err) {
    setConfigMsg(err.response?.data?.message || 'Failed to save configuration');
  } finally {
    setSavingConfig(false);
  }
};
const openAdd = () => {
  setForm(EMPTY_FORM);
  setEditId(null);
  setError('');
  setShowModal(true);
};
  const openEdit = (entry) => {
    setForm({
      dayOrder: entry.dayOrder,
      period: entry.period,
      subject: entry.subject,
      faculty: entry.faculty || '',
      roomNo: entry.roomNo || '',
      startTime: entry.startTime,
      endTime: entry.endTime
    });
    setEditId(entry._id);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.dayOrder || !form.period || !form.subject || !form.startTime || !form.endTime) {
      setError('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await timetableAPI.update(editId, form);
      } else {
        await timetableAPI.add(form);
      }
      setShowModal(false);
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await timetableAPI.delete(id);
      setEntries(prev => prev.filter(e => e._id !== id));
      setDeleteId(null);
    } catch {}
  };

  const filtered = filterDay ? entries.filter(e => e.dayOrder === parseInt(filterDay)) : entries;

  const grouped = [1,2,3,4,5,6].reduce((acc, d) => {
    const items = filtered.filter(e => e.dayOrder === d);
    if (items.length) acc[d] = items;
    return acc;
  }, {});

  if (loading) return <Layout pageTitle="Manage Classes"><Loader /></Layout>;

  return (
    <Layout pageTitle="Manage Classes">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Manage Classes</h1>
          <p className="page-subtitle">Add, edit and delete your timetable entries</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Class</button>
      </div>
{/* Semester Configuration Card */}
<div className="card semester-config-card">
  <div className="config-card-header">
    <div>
      <div className="config-card-title">
        ⚡ Automatic Day Order Configuration
      </div>
      <div className="config-card-sub">
        {config
          ? `Semester started ${new Date(config.semesterStartDate)
              .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              with Day Order ${config.startingDayOrder}`
          : 'Not configured yet — set your semester start date to enable automatic calculation'
        }
      </div>
    </div>
    <button
      className="btn btn-secondary"
      onClick={() => setShowConfig(v => !v)}
    >
      {showConfig ? 'Cancel' : config ? 'Edit Configuration' : 'Set Up Now'}
    </button>
  </div>

  {showConfig && (
    <form onSubmit={handleSaveConfig} className="config-form">
      {configMsg && <div className="alert alert-success">{configMsg}</div>}
      <div className="grid-2">
        <div className="form-group">
          <label>Semester Start Date *</label>
          <input
            type="date"
            className="form-control"
            value={configForm.semesterStartDate}
            onChange={e => setConfigForm(p => ({ ...p, semesterStartDate: e.target.value }))}
          />
          <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            The first working day your semester began
          </small>
        </div>
        <div className="form-group">
          <label>Day Order on Start Date *</label>
          <select
            className="form-control"
            value={configForm.startingDayOrder}
            onChange={e => setConfigForm(p => ({ ...p, startingDayOrder: e.target.value }))}
          >
            {[1,2,3,4,5,6].map(n => (
              <option key={n} value={n}>Day Order {n}</option>
            ))}
          </select>
          <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            What day order was active on that first day
          </small>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>Total Day Orders in Cycle</label>
          <select
            className="form-control"
            value={configForm.totalDayOrders}
            onChange={e => setConfigForm(p => ({ ...p, totalDayOrders: e.target.value }))}
          >
            {[3,4,5,6].map(n => <option key={n} value={n}>{n} Day Orders</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Skip Days</label>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={configForm.skipSaturday}
                onChange={e => setConfigForm(p => ({ ...p, skipSaturday: e.target.checked }))}
              />
              Skip Saturday
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={configForm.skipSunday}
                onChange={e => setConfigForm(p => ({ ...p, skipSunday: e.target.checked }))}
              />
              Skip Sunday
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={() => setShowConfig(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={savingConfig}>
          {savingConfig ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  )}
</div>
      {/* Filter */}
      <div className="manage-filter-bar">
        <label className="filter-label">Filter by Day Order:</label>
        <div className="filter-chips">
          <button className={`filter-chip ${filterDay === '' ? 'filter-chip--active' : ''}`} onClick={() => setFilterDay('')}>All</button>
          {[1,2,3,4,5,6].map(d => (
            <button key={d} className={`filter-chip ${filterDay === String(d) ? 'filter-chip--active' : ''}`} onClick={() => setFilterDay(String(d))}>DO {d}</button>
          ))}
        </div>
      </div>

      {/* Grouped entries */}
      {Object.keys(grouped).length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◫</div>
            <h3>No timetable entries</h3>
            <p>Click "Add Class" to build your timetable</p>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="day-group">
            <div className="day-group-header">
              <div className="day-group-badge">Day Order {day}</div>
              <span className="day-group-count">{items.length} classes</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th>Room</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.sort((a,b) => a.period - b.period).map(entry => (
                    <tr key={entry._id}>
                      <td><div className="period-chip">P{entry.period}</div></td>
                      <td style={{ fontWeight: 600 }}>{entry.subject}</td>
                      <td className="text-muted">{entry.faculty || '—'}</td>
                      <td className="text-muted">{entry.roomNo || '—'}</td>
                      <td><span className="time-chip">{entry.startTime} – {entry.endTime}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(entry)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(entry._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Class' : 'Add New Class'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Day Order <span style={{color:'var(--rose-400)'}}>*</span></label>
                  <select name="dayOrder" className="form-control" value={form.dayOrder} onChange={handleChange}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Period <span style={{color:'var(--rose-400)'}}>*</span></label>
                  <input type="number" name="period" className="form-control" placeholder="e.g. 1" min="1" max="10" value={form.period} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Subject <span style={{color:'var(--rose-400)'}}>*</span></label>
                <input type="text" name="subject" className="form-control" placeholder="e.g. Data Structures" value={form.subject} onChange={handleChange} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Faculty</label>
                  <input type="text" name="faculty" className="form-control" placeholder="Faculty name" value={form.faculty} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Room No.</label>
                  <input type="text" name="roomNo" className="form-control" placeholder="e.g. A101" value={form.roomNo} onChange={handleChange} />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Start Time <span style={{color:'var(--rose-400)'}}>*</span></label>
                  <input type="time" name="startTime" className="form-control" value={form.startTime} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>End Time <span style={{color:'var(--rose-400)'}}>*</span></label>
                  <input type="time" name="endTime" className="form-control" value={form.endTime} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Class'}
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
              <h3 className="modal-title">Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Are you sure you want to delete this class entry? This cannot be undone.</p>
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

export default ManageTimetable;
