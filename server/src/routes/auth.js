'use strict';

const crypto = require('crypto');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { JWT_SECRET } = require('../config');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

function getBaseUrl(req) {
  const origin = req.get('origin') || req.get('referer');
  if (origin) {
    try {
      const u = new URL(origin);
      return `${u.protocol}//${u.host}`;
    } catch {}
  }
  return null;
}

// ----------------------------------------------------
// Register
// ----------------------------------------------------
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name = '', email = '', password = '', startDate } = req.body;
    if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ message: 'Enter your name.' });
    if (name.trim().length > 60) return res.status(400).json({ message: 'Name must be 60 characters or fewer.' });
    if (typeof email !== 'string' || !EMAIL.test(email.trim())) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (email.trim().length > 100) return res.status(400).json({ message: 'Email must be 100 characters or fewer.' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Use a password with at least 6 characters.' });
    if (password.length > 128) return res.status(400).json({ message: 'Password cannot exceed 128 characters.' });

    const cleanEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      ...(typeof startDate === 'string' && DATE.test(startDate) ? { startDate } : {}),
    });

    // Send verification email in background
    sendVerificationEmail(user, verificationToken, getBaseUrl(req)).catch((err) =>
      console.error('Error sending registration verification email:', err)
    );

    res.status(201).json({ token: sign(user.id), user });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Verify Email
// ----------------------------------------------------
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully!',
      token: sign(user.id),
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Resend Verification Email
// ----------------------------------------------------
router.post('/resend-verification', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    let cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // If no email provided, check if user is authenticated via Bearer token
    if (!cleanEmail && req.headers.authorization) {
      try {
        const t = req.headers.authorization.replace(/^Bearer\s+/i, '');
        const decoded = jwt.verify(t, JWT_SECRET);
        const authUser = await User.findById(decoded.id);
        if (authUser) cleanEmail = authUser.email;
      } catch {}
    }

    if (!cleanEmail || !EMAIL.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.json({ message: 'If that email exists, a verification link has been sent.' });
    }

    if (user.isVerified) {
      return res.json({ message: 'This email is already verified.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user, verificationToken, getBaseUrl(req));

    res.json({ message: 'Verification email sent! Please check your inbox (and spam folder).' });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Forgot Password
// ----------------------------------------------------
router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email = '' } = req.body;
    if (typeof email !== 'string' || !EMAIL.test(email.trim())) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      await sendPasswordResetEmail(user, resetToken, getBaseUrl(req));
    }

    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account exists with that email, password reset instructions have been sent.',
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Reset Password
// ----------------------------------------------------
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token = '', password = '' } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Reset token is required.' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'New password must have at least 6 characters.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Password cannot exceed 128 characters.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset link is invalid or has expired.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful! You can now sign in with your new password.',
      token: sign(user.id),
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Login
// ----------------------------------------------------
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email = '', password = '' } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials format.' });
    }
    if (email.length > 100 || password.length > 128) {
      return res.status(400).json({ message: 'Invalid credentials format.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    res.json({ token: sign(user.id), user });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------
// Current User Profile
// ----------------------------------------------------
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'Account not found. Please sign in again.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.put('/me', auth, async (req, res, next) => {
  try {
    const { name, targetBand, startDate } = req.body;
    const update = {};
    if (typeof name === 'string' && name.trim()) {
      if (name.trim().length > 60) return res.status(400).json({ message: 'Name must be 60 characters or fewer.' });
      update.name = name.trim();
    }
    if (targetBand !== undefined) {
      const n = Number(targetBand);
      if (!(n >= 4 && n <= 9)) return res.status(400).json({ message: 'Target band must be between 4.0 and 9.0.' });
      update.targetBand = n;
    }
    if (startDate !== undefined) {
      if (!DATE.test(startDate)) return res.status(400).json({ message: 'Enter a valid start date.' });
      update.startDate = startDate;
    }
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
