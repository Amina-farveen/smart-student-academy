const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const passwordResetOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  // OTP is stored as a bcrypt hash — never plain text
  otpHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  // Track failed attempts to prevent brute-force
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// MongoDB TTL index — auto-deletes expired documents
passwordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method: generate OTP, hash it, store it, return plain OTP for emailing
passwordResetOTPSchema.statics.createOTP = async function (userId, email) {
  // Delete any existing OTPs for this user first
  await this.deleteMany({ userId });

  // Generate a 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash for storage
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  // Expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await this.create({ userId, email, otpHash, expiresAt });

  // Return plain OTP to be emailed — NOT stored in DB
  return otp;
};

// Static method: verify submitted OTP against stored hash
passwordResetOTPSchema.statics.verifyOTP = async function (email, submittedOTP) {
  const record = await this.findOne({
    email: email.toLowerCase(),
    verified: false,
    expiresAt: { $gt: new Date() }
  });

  if (!record) {
    return { valid: false, reason: 'OTP expired or not found. Please request a new one.' };
  }

  if (record.attempts >= 5) {
    await record.deleteOne();
    return { valid: false, reason: 'Too many failed attempts. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(submittedOTP, record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      reason: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
    };
  }

  // Mark as verified — allows one password reset use only
  record.verified = true;
  await record.save();

  return { valid: true, userId: record.userId, recordId: record._id };
};

module.exports = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
