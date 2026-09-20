'use strict';

const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_URL } = require('../config');

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Base email layout matching IELTS platform branding
 */
function emailLayout({ title, heading, bodyHtml, buttonText, buttonUrl, noteText }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #12233f;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f5f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 14px; border: 1px solid #dce2ec; box-shadow: 0 4px 20px rgba(18, 35, 63, 0.06); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #12233f; padding: 24px 32px; text-align: left;">
              <span style="display: inline-block; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
                🎓 IELTS 90-Day Mastery
              </span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; line-height: 1.3; color: #12233f; font-weight: 700;">${heading}</h1>
              <div style="font-size: 15px; line-height: 1.6; color: #566780; margin-bottom: 28px;">
                ${bodyHtml}
              </div>
              <!-- CTA Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #12233f;">
                    <a href="${buttonUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 10px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #7a8ba3;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${buttonUrl}" style="color: #2e4e93; word-break: break-all;">${buttonUrl}</a>
              </p>
              ${noteText ? `<p style="margin: 20px 0 0 0; padding-top: 16px; border-top: 1px solid #edf0f5; font-size: 12px; line-height: 1.5; color: #94a3b8;">${noteText}</p>` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafbfc; padding: 18px 32px; border-top: 1px solid #edf0f5; text-align: center; font-size: 12px; color: #8c9bb0;">
              IELTS 90-Day Mastery Platform · Designed to take you from Foundations to Band 8.0+
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send email verification link
 */
async function sendVerificationEmail(user, token, baseUrl) {
  const rootUrl = (baseUrl || APP_URL).replace(/\/+$/, '');
  const verifyUrl = `${rootUrl}/?verifyToken=${encodeURIComponent(token)}`;

  const html = emailLayout({
    title: 'Verify your email - IELTS 90-Day Mastery',
    heading: 'Verify your email address',
    bodyHtml: `Hi <strong>${user.name}</strong>,<br><br>Thank you for joining the IELTS 90-Day Mastery Platform! Please verify your email address to confirm your account and ensure your study progress is protected.`,
    buttonText: 'Verify My Email',
    buttonUrl: verifyUrl,
    noteText: 'This verification link is valid for 24 hours. If you did not create this account, no action is needed.',
  });

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Verify your email - IELTS 90-Day Mastery',
        html,
      });
      console.log(`Verification email sent to ${user.email}`);
      return { sent: true };
    } catch (err) {
      console.error('Failed to send verification email via SMTP:', err);
    }
  }

  // Developer / Fallback mode: Print to console and return URL
  console.log('\n================ EMAIL VERIFICATION LINK (FALLBACK) ================');
  console.log(`To: ${user.email}`);
  console.log(`Link: ${verifyUrl}`);
  console.log('====================================================================\n');
  return { sent: false, previewUrl: verifyUrl };
}

/**
 * Send password reset link
 */
async function sendPasswordResetEmail(user, token, baseUrl) {
  const rootUrl = (baseUrl || APP_URL).replace(/\/+$/, '');
  const resetUrl = `${rootUrl}/?resetToken=${encodeURIComponent(token)}`;

  const html = emailLayout({
    title: 'Reset your password - IELTS 90-Day Mastery',
    heading: 'Reset your account password',
    bodyHtml: `Hi <strong>${user.name}</strong>,<br><br>We received a request to reset the password for your IELTS 90-Day Mastery account. Click the button below to choose a new password:`,
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    noteText: 'This password reset link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.',
  });

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: user.email,
        subject: 'Reset your password - IELTS 90-Day Mastery',
        html,
      });
      console.log(`Password reset email sent to ${user.email}`);
      return { sent: true };
    } catch (err) {
      console.error('Failed to send password reset email via SMTP:', err);
    }
  }

  // Developer / Fallback mode: Print to console and return URL
  console.log('\n================ PASSWORD RESET LINK (FALLBACK) ================');
  console.log(`To: ${user.email}`);
  console.log(`Link: ${resetUrl}`);
  console.log('================================================================\n');
  return { sent: false, previewUrl: resetUrl };
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
