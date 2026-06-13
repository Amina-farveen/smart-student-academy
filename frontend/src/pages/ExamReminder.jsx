import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { examAPI } from '../services/api';
import './ExamReminder.css';

const EMPTY_FORM = { subject: '', examType: '', examDate: '', description: '' };

const EXAM_TYPES = ['Internal Assessment', 'Mid Semester', 'End Semester', 'Practical', 'Viva', 'Quiz', 'Other'];

const ExamReminder = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    try {
      const { data } = await examAPI.getAll();
      setExams(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (exam) => {
    setForm({
      subject: exam.subject,
      examType: exam.examType,
      examDate: exam.examDate ? exam.examDate.split('T')[0] : '',
      description: exam.description || ''
    });
    setEditId(exam._id);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.examType || !form.examDate) {
      setError('Subject, exam type and date are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await examAPI.update(editId, form);
        setExams(prev => prev.map(ex => ex._id === editId ? { ...data.data, daysRemaining: getDays(data.data.examDate), status: getStatus(data.data.examDate) } : ex));
      } else {
        await examAPI.add(form);
        fetchExams();
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await examAPI.delete(id);
      setExams(prev => prev.filter(e => e._id !== id));
      setDeleteId(null);
    } catch {}
  };

  const today = new Date(); today.setHours(0,0,0,0);

  const getDays = (date) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (date) => {
    const days = getDays(date);
    if (days < 0) return 'past';
    if (days === 0) return 'today';
    return 'upcoming';
  };

  const filtered = exams.filter(e => {
    if (filter === 'upcoming') return e.status === 'upcoming' || e.status === 'today';
    if (filter === 'past') return e.status === 'past';
    return true;
  });

  const upcoming = exams.filter(e => e.status === 'upcoming' || e.status === 'today').length;
  const nextExam = exams.filter(e => e.status === 'upcoming' || e.status === 'today').sort((a,b) => a.daysRemaining - b.daysRemaining)[0];

  if (loading) return <Layout pageTitle="Exam Schedule"><Loader /></Layout>;

  return (
    <Layout pageTitle="Exam Schedule">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Exam Schedule</h1>
          <p className="page-subtitle">Track your upcoming exams and countdowns</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Exam</button>
      </div>

      {/* Summary Cards */}
      <div className="exam-summary">
        <div className="exam-summary-card exam-summary-card--upcoming">
          <div className="escard-icon">◷</div>
          <div>
            <div className="escard-value">{upcoming}</div>
            <div className="escard-label">Upcoming Exams</div>
          </div>
        </div>
        {nextExam && (
          <div className="exam-summary-card exam-summary-card--next">
            <div className="escard-icon">◈</div>
            <div>
              <div className="escard-value">
                {nextExam.daysRemaining === 0 ? 'Today!' : `${nextExam.daysRemaining}d`}
              </div>
              <div className="escard-label">Next: {nextExam.subject}</div>
            </div>
          </div>
        )}
        <div className="exam-summary-card">
          <div className="escard-icon">✦</div>
          <div>
            <div className="escard-value">{exams.length}</div>
            <div className="escard-label">Total Exams</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="exam-tabs">
        {['all', 'upcoming', 'past'].map(f => (
          <button key={f} className={`exam-tab ${filter === f ? 'exam-tab--active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="exam-tab-count">
              {f === 'all' ? exams.length : f === 'upcoming' ? exams.filter(e => e.status !== 'past').length : exams.filter(e => e.status === 'past').length}
            </span>
          </button>
        ))}
      </div>

      {/* Exam Cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◷</div>
            <h3>No exams {filter !== 'all' ? `in ${filter}` : ''}</h3>
            <p>Add exams to track your schedule and countdowns</p>
          </div>
        </div>
      ) : (
        <div className="exams-grid">
          {filtered.sort((a,b) => new Date(a.examDate) - new Date(b.examDate)).map(exam => {
            const days = exam.daysRemaining;
            const urgency = days <= 3 ? 'urgent' : days <= 7 ? 'soon' : 'normal';
            return (
              <div key={exam._id} className={`exam-card exam-card--${exam.status} exam-card--${urgency}`}>
                <div className="exam-card-header">
                  <div>
                    <div className="exam-card-type">{exam.examType}</div>
                    <div className="exam-card-subject">{exam.subject}</div>
                  </div>
                  <div className={`exam-countdown-badge countdown--${urgency} ${exam.status === 'past' ? 'countdown--past' : ''}`}>
                    {exam.status === 'today' ? 'TODAY' :
                     exam.status === 'past' ? 'Done' :
                     days === 1 ? '1 day' : `${days} days`}
                  </div>
                </div>

                {exam.description && (
                  <p className="exam-card-desc">{exam.description}</p>
                )}

                <div className="exam-card-footer">
                  <div className="exam-date-display">
                    <span className="exam-date-icon">◷</span>
                    {new Date(exam.examDate).toLocaleDateString('en-US', {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(exam)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(exam._id)}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Exam' : 'Add Exam'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="text" name="subject" className="form-control" placeholder="e.g. Data Structures" value={form.subject} onChange={handleChange} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Exam Type <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                  <select name="examType" className="form-control" value={form.examType} onChange={handleChange}>
                    <option value="">Select type</option>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Date <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                  <input type="date" name="examDate" className="form-control" value={form.examDate} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes / Description</label>
                <textarea name="description" className="form-control" rows="2" placeholder="Syllabus, venue, etc." value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Exam'}
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
              <h3 className="modal-title">Delete Exam</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Remove this exam from your schedule?</p>
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

export default ExamReminder;
