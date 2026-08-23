import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { notesAPI } from '../services/api';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [notesRes, subjRes] = await Promise.all([
        notesAPI.getAll(),
        notesAPI.getSubjects()
      ]);
      setNotes(notesRes.data.data);
      setSubjects(subjRes.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const fetchNotes = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterSubject) params.subject = filterSubject;
      const { data } = await notesAPI.getAll(params);
      setNotes(data.data);
    } catch {}
  };

  useEffect(() => {
    const timeout = setTimeout(fetchNotes, 400);
    return () => clearTimeout(timeout);
  }, [search, filterSubject]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    setSelectedFile(f || null);
    setError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.subject.trim()) { setError('Title and subject are required'); return; }
    if (!selectedFile) { setError('Please select a PDF file'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subject', form.subject);
      fd.append('noteFile', selectedFile);
      await notesAPI.upload(fd);
      setShowModal(false);
      setForm({ title: '', subject: '' });
      setSelectedFile(null);
      setSuccess('Note uploaded successfully');
      fetchAll();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notesAPI.delete(id);
      setNotes(prev => prev.filter(n => n._id !== id));
      setDeleteId(null);
      setSuccess('Note deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return <Layout pageTitle="Notes"><Loader /></Layout>;

  return (
    <Layout pageTitle="Notes">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">Upload and manage your PDF study materials</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowModal(true); }}>+ Upload Note</button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="notes-stats">
        <div className="nstat">
          <span className="nstat-value">{notes.length}</span>
          <span className="nstat-label">Total Notes</span>
        </div>
        <div className="nstat">
          <span className="nstat-value">{subjects.length}</span>
          <span className="nstat-label">Subjects</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="notes-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">◉</div>
            <h3>No notes found</h3>
            <p>{search || filterSubject ? 'Try adjusting your search or filter' : 'Upload your first PDF note to get started'}</p>
          </div>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <div className="note-card-top">
                <div className="pdf-icon">PDF</div>
                <div className="note-subject-badge">{note.subject}</div>
              </div>
              <div className="note-card-body">
                <div className="note-title">{note.title}</div>
                <div className="note-filename">{note.fileName}</div>
                <div className="note-meta">
                  <span>{formatSize(note.fileSize)}</span>
                  <span>{formatDate(note.uploadedAt)}</span>
                </div>
              </div>
              <div className="note-card-actions">
                <a
                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${note.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  download
                >
                  ↓ Download
                </a>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(note._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload Note</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Title <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="text" name="title" className="form-control" placeholder="e.g. Unit 1 Notes" value={form.title} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Subject <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <input type="text" name="subject" className="form-control" placeholder="e.g. Data Structures" value={form.subject} onChange={handleChange} list="subject-suggestions" />
                <datalist id="subject-suggestions">
                  {subjects.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="form-group">
                <label>PDF File <span style={{ color: 'var(--rose-400)' }}>*</span></label>
                <div className="file-drop-zone" onClick={() => fileInputRef.current?.click()}>
                  {selectedFile ? (
                    <div className="file-selected">
                      <span className="pdf-icon-sm">PDF</span>
                      <span>{selectedFile.name}</span>
                      <span className="text-muted text-sm">{formatSize(selectedFile.size)}</span>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <span style={{ fontSize: '1.5rem' }}>↑</span>
                      <span>Click to select PDF file</span>
                      <span className="text-xs text-muted">Max 20 MB</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Note'}
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
              <h3 className="modal-title">Delete Note</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Delete this note? The PDF file will be permanently removed.</p>
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

export default Notes;
