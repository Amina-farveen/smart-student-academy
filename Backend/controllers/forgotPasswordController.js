// ─────────────────────────────────────────────────────────
// FORGOT PASSWORD CONTROLLER
// Add these three functions to your existing authController.js
// Also add the imports at the top of your authController.js:
//
//   const PasswordResetOTP = require('../models/PasswordResetOTP');
//   const { sendPasswordResetOTP } = require('../utils/emailUtils');
// ─────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordResetOTP = require('../models/PasswordResetOTP');
const { sendPasswordResetOTP } = require('../utils/emailUtils');

// ─────────────────────────────────────────────────────────
// STEP 1 — Send OTP to registered email
// POST /api/auth/forgot-password
// Body: { email }
// ─────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    
    const { email } = req.body;
 console.log("email received",email);
  
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return the same response to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, an OTP has been sent to it.'
      });
    }
console.log("user found",user.email);
    // Generate OTP — model static method deletes old OTPs and creates new hashed one
    const otp = await PasswordResetOTP.createOTP(user._id, user.email);
console.log("otp generated");
    // Send email
    try {
      await sendPasswordResetOTP({
        toEmail: user.email,
        userName: user.name,
        otp
      });
     
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Delete the OTP record since email failed
      await PasswordResetOTP.deleteMany({ userId: user._id });
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email address and try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. It expires in 10 minutes.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────
// STEP 2 — Verify OTP
// POST /api/auth/verify-otp
// Body: { email, otp }
// Returns: { resetToken } — a short-lived JWT for the reset step
// ─────────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit number'
      });
    }

    const result = await PasswordResetOTP.verifyOTP(email.toLowerCase().trim(), otp);

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    // Generate a short-lived reset token (5 minutes)
    // purpose claim ensures this token cannot be used as a login token
    const resetToken = jwt.sign(
      {
        userId: result.userId,
        purpose: 'password-reset',
        recordId: result.recordId
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      resetToken
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────
// STEP 3 — Reset Password
// POST /api/auth/reset-password
// Body: { resetToken, newPassword, confirmPassword }
// ─────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Verify and decode the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired. Please start the forgot password process again.'
      });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    // Confirm the OTP record still exists and is verified (one-time use check)
    const otpRecord = await PasswordResetOTP.findOne({
      _id: decoded.recordId,
      userId: decoded.userId,
      verified: true
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Reset token already used or expired. Please request a new OTP.'
      });
    }

    // Find user and update password
    // The User model's pre-save hook will hash the new password automatically
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete the OTP record so it cannot be reused
    await PasswordResetOTP.deleteMany({ userId: decoded.userId });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { forgotPassword, verifyOTP, resetPassword };
