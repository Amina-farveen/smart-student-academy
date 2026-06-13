// ─────────────────────────────────────────────────────────
// FORGOT PASSWORD ROUTES
//
// Option A — Standalone router (recommended):
//   In server.js add:
//   app.use('/api/auth', require('./routes/forgotPasswordRoutes'));
//
// Option B — Merge into your existing authRoutes.js:
//   Copy the three router.post() lines below into authRoutes.js
//   and import the three functions from forgotPasswordController.js
// ─────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const {
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/forgotPasswordController');

// Step 1 — Request OTP
// POST /api/auth/forgot-password
// Body: { email: string }
router.post('/forgot-password', forgotPassword);

// Step 2 — Verify OTP and receive resetToken
// POST /api/auth/verify-otp
// Body: { email: string, otp: string }
router.post('/verify-otp', verifyOTP);

// Step 3 — Set new password using resetToken
// POST /api/auth/reset-password
// Body: { resetToken: string, newPassword: string, confirmPassword: string }
router.post('/reset-password', resetPassword);

module.exports = router;
