import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import './ForgotPassword.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const VerifyOTP = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const email = sessionStorage.getItem('resetEmail') || '';

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email, navigate]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');
    // Auto-advance focus to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      sessionStorage.setItem('resetToken', data.resetToken);
      navigate('/reset-password');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    setResendMsg('');
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setResendMsg('A new OTP has been sent to your email.');
      setDigits(['', '', '', '', '', '']);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(0, b.length)) + c)
    : '';

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
          <div className="reset-step reset-step--active">
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
          <div className="auth-card-header">
            <div className="fp-icon-wrap">
              <span className="fp-icon">📧</span>
            </div>
            <h2 className="auth-title">Enter OTP</h2>
            <p className="auth-subtitle">
              We sent a 6-digit code to{' '}
              <strong className="fp-email-highlight">{maskedEmail}</strong>
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {resendMsg && <div className="alert alert-success">{resendMsg}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="otp-input-row" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-digit-input ${digit ? 'otp-digit-input--filled' : ''}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                  autoComplete="off"
                />
              ))}
            </div>

            <div className="otp-expiry-note">
              Code expires in <strong>10 minutes</strong>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading || digits.join('').length !== 6}
            >
              {loading ? (
                <><span className="auth-spinner" />Verifying...</>
              ) : 'Verify OTP'}
            </button>
          </form>

          <div className="otp-resend-section">
            <span className="otp-resend-label">Didn't receive the code?</span>
            {countdown > 0 ? (
              <span className="otp-countdown">Resend in {countdown}s</span>
            ) : (
              <button
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <p className="auth-switch">
            <Link to="/forgot-password" className="auth-link">← Change email</Link>
            {' · '}
            <Link to="/login" className="auth-link">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
