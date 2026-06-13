import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import './ForgotPassword.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: email.trim() });
      setSent(true);
      // Store email in sessionStorage so VerifyOTP page can use it
      sessionStorage.setItem('resetEmail', email.trim().toLowerCase());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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

        {/* Step indicator */}
        <div className="reset-steps">
          <div className="reset-step reset-step--active">
            <div className="step-circle">1</div>
            <span className="step-label">Email</span>
          </div>
          <div className="step-connector" />
          <div className="reset-step">
            <div className="step-circle">2</div>
            <span className="step-label">OTP</span>
          </div>
          <div className="step-connector" />
          <div className="reset-step">
            <div className="step-circle">3</div>
            <span className="step-label">Reset</span>
          </div>
        </div>

        <div className="auth-card">
          {!sent ? (
            <>
              <div className="auth-card-header">
                <div className="fp-icon-wrap">
                  <span className="fp-icon">🔑</span>
                </div>
                <h2 className="auth-title">Forgot Password?</h2>
                <p className="auth-subtitle">
                  Enter the email address linked to your account.
                  We'll send you a 6-digit OTP.
                </p>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="auth-spinner" />Sending OTP...</>
                  ) : 'Send OTP'}
                </button>
              </form>
            </>
          ) : (
            <div className="fp-success-state">
              <div className="fp-success-icon">✉</div>
              <h2 className="auth-title" style={{ textAlign: 'center' }}>OTP Sent!</h2>
              <p className="fp-success-msg">
                A 6-digit OTP has been sent to<br />
                <strong className="fp-email-highlight">{email}</strong>
              </p>
              <p className="fp-success-note">
                Check your inbox and spam folder. The OTP expires in{' '}
                <strong>10 minutes</strong>.
              </p>
              <button
                className="btn btn-primary auth-submit-btn"
                onClick={() => navigate('/verify-otp')}
              >
                Enter OTP →
              </button>
              <button
                className="fp-resend-btn"
                onClick={() => { setSent(false); setError(''); }}
              >
                Use a different email
              </button>
            </div>
          )}

          <p className="auth-switch">
            Remember your password?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
