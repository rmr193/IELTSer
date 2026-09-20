'use strict';

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter for all /api endpoints.
 * Allows up to 300 requests per 15-minute window per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please slow down and try again in a few minutes.',
  },
});

/**
 * Strict rate limiter for sensitive authentication endpoints (/register, /login).
 * Blocks brute-force and credential stuffing by restricting to 15 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
