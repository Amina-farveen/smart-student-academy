const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendPasswordResetOTP = async ({ toEmail, userName, otp }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'SmartAcademy <noreply@smartacademy.com>',
    to: toEmail,
    subject: 'SmartAcademy — Password Reset OTP',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Password Reset OTP</title>
        <style>
          body { margin: 0; padding: 0; background: #070d1f; font-family: 'Segoe UI', Arial, sans-serif; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #0c1530; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
          .header { background: linear-gradient(135deg, #0f1a3e 0%, #162050 100%); padding: 32px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .brand { display: inline-flex; align-items: center; gap: 10px; }
          .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #060b18; }
          .brand-name { font-size: 1.3rem; font-weight: 800; color: #f0f4ff; letter-spacing: -0.02em; }
          .body { padding: 40px; }
          .greeting { font-size: 1rem; color: #8fa3c8; margin-bottom: 8px; }
          .heading { font-size: 1.4rem; font-weight: 700; color: #f0f4ff; margin-bottom: 24px; letter-spacing: -0.01em; }
          .otp-box { background: #111c3a; border: 1px solid rgba(245,158,11,0.25); border-radius: 14px; padding: 28px; text-align: center; margin: 28px 0; }
          .otp-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8fa3c8; margin-bottom: 12px; }
          .otp-code { font-size: 2.8rem; font-weight: 800; letter-spacing: 0.2em; color: #fbbf24; font-family: 'Courier New', monospace; }
          .otp-expiry { font-size: 0.8rem; color: #4d6490; margin-top: 12px; }
          .info-text { font-size: 0.875rem; color: #8fa3c8; line-height: 1.6; margin-bottom: 16px; }
          .warning-box { background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.2); border-radius: 10px; padding: 14px 16px; margin-top: 24px; }
          .warning-text { font-size: 0.82rem; color: #fb7185; line-height: 1.5; margin: 0; }
          .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
          .footer-text { font-size: 0.75rem; color: #4d6490; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="brand">
              <div class="brand-icon">S</div>
              <span class="brand-name">SmartAcademy</span>
            </div>
          </div>
          <div class="body">
            <p class="greeting">Hello, ${userName}</p>
            <h2 class="heading">Password Reset Request</h2>
            <p class="info-text">
              We received a request to reset your SmartAcademy password. Use the OTP below.
              This code is valid for <strong style="color:#fbbf24;">10 minutes</strong> only.
            </p>
            <div class="otp-box">
              <div class="otp-label">Your One-Time Password</div>
              <div class="otp-code">${otp}</div>
              <div class="otp-expiry">Expires in 10 minutes</div>
            </div>
            <p class="info-text">
              Enter this code on the password reset page to set a new password.
            </p>
            <div class="warning-box">
              <p class="warning-text">
                ⚠ If you did not request a password reset, please ignore this email.
                Your account remains secure and no changes have been made.
              </p>
            </div>
          </div>
          <div class="footer">
            <p class="footer-text">
              This is an automated message from SmartAcademy Student Portal.<br/>
              Do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const verifyTransporter = async () => {
  const transporter = createTransporter();
  return await transporter.verify();
};

module.exports = { sendPasswordResetOTP, verifyTransporter };
