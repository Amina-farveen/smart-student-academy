import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import './ForgotPassword.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ResetPassword = () => {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const resetToken = sessionStorage.getItem('resetToken') || '';

  useEffect(() => {
    if (!resetToken) navigate('/forgot-password');
  }, [resetToken, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Very Weak', color: 'strength--weak' };
    if (score === 2) return { score, label: 'Weak', color: 'strength--weak' };
    if (score === 3) return { score, label: 'Fair', color: 'strength--fair' };
    if (score === 4) return { score, label: 'Strong', color: 'strength--strong' };
    return { score, label: 'Very Strong', color: 'strength--very-strong' };
  };

  const strength = getStrength(form.newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.newPassword || !form.confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        resetToken,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetToken');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb--1" />
        <div className="auth-bg-orb auth-bg-orb--2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-brand-icon">S</div>
          <span className="auth-brand-name">SmartAcademy</span>
        </div>

        <div className="reset-steps">
          <div className="reset-step reset-step--done">
            <div className="step-circle">✓</div>
            <span className="step-label">Email</span>
          </div>
          <div className="step-connector step-connector--done" />
          <div className="reset-step reset-step--done">
            <div className="step-circle">✓</div>
            <span className="step-label">OTP</span>
          </div>
          <div className="step-connector step-connector--done" />
          <div className="reset-step reset-step--active">
            <div className="step-circle">3</div>
            <span className="step-label">Reset</span>
          </div>
        </div>

        <div className="auth-card">
          {!success ? (
            <>
              <div className="auth-card-header">
                <div className="fp-icon-wrap">
                  <span className="fp-icon">🔒</span>
                </div>
                <h2 className="auth-title">Set New Password</h2>
                <p className="auth-subtitle">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? 'text' : 'password'}
                      className="form-control password-input"
                      placeholder="At least 6 characters"
                      value={form.newPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNew(v => !v)}
                      tabIndex={-1}
                    >
                      {showNew ? '🙈' : '👁'}
                    </button>
                  </div>

                  {/* Live password strength bar */}
                  {form.newPassword && (
                    <div className="strength-bar-wrap">
                      <div className="strength-bar">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`strength-segment ${i <= strength.score ? strength.color : ''}`}
                          />
                        ))}
                      </div>
                      <span className={`strength-label ${strength.color}`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      className={`form-control password-input ${
                        form.confirmPassword && form.confirmPassword !== form.newPassword
                          ? 'input-error'
                          : form.confirmPassword && form.confirmPassword === form.newPassword
                          ? 'input-success'
                          : ''
                      }`}
                      placeholder="Repeat your new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(v => !v)}
                      tabIndex={-1}
                    >
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                  {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                    <span className="field-error-msg">Passwords do not match</span>
                  )}
                  {form.confirmPassword && form.confirmPassword === form.newPassword && (
                    <span className="field-success-msg">✓ Passwords match</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="auth-spinner" />Resetting Password...</>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login" className="auth-link">← Back to login</Link>
              </p>
            </>
          ) : (
            <div className="fp-success-state">
              <div className="fp-success-icon" style={{ color: 'var(--emerald-400)' }}>✓</div>
              <h2 className="auth-title" style={{ textAlign: 'center' }}>Password Reset!</h2>
              <p className="fp-success-msg">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>
              <button
                className="btn btn-primary auth-submit-btn"
                onClick={() => navigate('/login')}
              >
                Go to Login →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
