require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  get MONGODB_URI() {
    return process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts90';
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || 'ielts-mastery-jwt-secret-key-prod-2026';
  },
  PORT: process.env.PORT || 5000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim())
    : true,
  isProd,
  // SMTP Email configuration
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || '"IELTS 90-Day Mastery" <no-reply@ielts90.com>',
  get APP_URL() {
    if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:5173';
  },
};
