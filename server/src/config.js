require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.JWT_SECRET && isProd) {
  throw new Error('JWT_SECRET must be set in production.');
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ielts90',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim())
    : true,
  isProd,
};
