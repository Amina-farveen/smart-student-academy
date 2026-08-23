import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import { profileAPI } from '../services/api';
import './Profile.css';

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setProfile(data.data);
      setForm(data.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { data } = await profileAPI.update({
        fullName: form.fullName,
        registerNumber: form.registerNumber,
        collegeName: form.collegeName,
        department: form.department,
        semester: form.semester,
        email: form.email,
        phone: form.phone
      });
      setProfile(data.data);
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('profilePhoto', file);
      const { data } = await profileAPI.uploadPhoto(fd);
      setProfile(prev => ({ ...prev, profilePhoto: data.data.profilePhoto }));
      setSuccess('Photo updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

 const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) return <Layout pageTitle="My Profile"><Loader /></Layout>;

  return (
    <Layout pageTitle="My Profile">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your academic profile and personal information</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-layout">
        {/* Left Panel — Photo + Basic */}
        <div className="profile-sidebar-panel">
          <div className="profile-photo-card card">
            <div className="photo-wrapper">
              {profile?.profilePhoto ? (
                <img src={getPhotoUrl(profile.profilePhoto)} alt="Profile" className="profile-photo" />
              ) : (
                <div className="profile-avatar-large">{getInitials(profile?.fullName)}</div>
              )}
              <button
                className="photo-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? '...' : '📷'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="profile-name-display">{profile?.fullName || 'Student'}</div>
            {profile?.registerNumber && (
              <div className="profile-reg">{profile.registerNumber}</div>
            )}
            {profile?.department && (
              <span className="badge badge-amber" style={{ marginTop: '8px' }}>{profile.department}</span>
            )}
          </div>

          <div className="profile-info-card card">
            <h4 className="profile-info-title">Quick Info</h4>
            <div className="info-rows">
              <InfoRow label="College" value={profile?.collegeName} />
              <InfoRow label="Semester" value={profile?.semester} />
              <InfoRow label="Email" value={profile?.email} />
              <InfoRow label="Phone" value={profile?.phone} />
            </div>
          </div>
        </div>

        {/* Right Panel — Edit Form */}
        <div className="profile-main-panel">
          <div className="card">
            <div className="profile-form-header">
              <h3 className="section-title">Academic Information</h3>
              {!editing && (
                <button className="btn btn-secondary" onClick={() => { setEditing(true); setError(''); }}>
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="fullName" className="form-control" value={form.fullName || ''} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label>Register Number</label>
                    <input type="text" name="registerNumber" className="form-control" value={form.registerNumber || ''} onChange={handleChange} placeholder="e.g. 22CS001" />
                  </div>
                </div>

                <div className="form-group">
                  <label>College Name</label>
                  <input type="text" name="collegeName" className="form-control" value={form.collegeName || ''} onChange={handleChange} placeholder="Your college name" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" className="form-control" value={form.department || ''} onChange={handleChange} placeholder="e.g. Computer Science" />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <select name="semester" className="form-control" value={form.semester || ''} onChange={handleChange}>
                      <option value="">Select Semester</option>
                      {SEMESTERS.map(s => <option key={s} value={s}>{s} Semester</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-control" value={form.email || ''} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" className="form-control" value={form.phone || ''} onChange={handleChange} placeholder="10-digit number" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setForm(profile); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-view-grid">
                <ProfileField label="Full Name" value={profile?.fullName} />
                <ProfileField label="Register Number" value={profile?.registerNumber} />
                <ProfileField label="College" value={profile?.collegeName} />
                <ProfileField label="Department" value={profile?.department} />
                <ProfileField label="Semester" value={profile?.semester} />
                <ProfileField label="Email" value={profile?.email} />
                <ProfileField label="Phone" value={profile?.phone} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || '—'}</span>
  </div>
);

const ProfileField = ({ label, value }) => (
  <div className="pfield">
    <div className="pfield-label">{label}</div>
    <div className="pfield-value">{value || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
  </div>
);

export default Profile;
