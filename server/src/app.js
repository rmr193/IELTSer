'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { CLIENT_ORIGIN } = require('./config');
const sanitize = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust reverse proxy (Vercel, Render, Cloudflare, etc.)
app.set('trust proxy', 1);

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security HTTP headers with Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com'],
        frameSrc: ["'self'", 'https://accounts.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://*.googleusercontent.com'],
        connectSrc: ["'self'", 'https:', 'https://accounts.google.com'],
      },
    },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(cors({ origin: CLIENT_ORIGIN }));

// HTTP Parameter Pollution protection
app.use(hpp());

// Body parsers with size constraints
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// NoSQL query selector sanitization
app.use(sanitize);

// In serverless rewrites, ensure path has /api prefix for matching routes
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/favicon.ico')) {
    req.url = '/api' + req.url;
  }
  next();
});

// General rate limiter for all /api endpoints
app.use('/api', apiLimiter);

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid parameter format.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'That record already exists.' });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error. Please try again.' });
});

module.exports = app;
