'use strict';

const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const config = require('../config');

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const sign = (id) => jwt.sign({ id }, config.JWT_SECRET, { expiresIn: '30d' });
const googleClient = new OAuth2Client();

// ----------------------------------------------------
// Google Sign-In
// ----------------------------------------------------
router.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ message: 'Google credential token is required.' });
    }

    const clientId = config.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID is not configured in server environment.');
      return res.status(500).json({
        message: 'Google Sign-In is not configured on the server. Please set GOOGLE_CLIENT_ID in your environment variables.',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Unable to retrieve email from Google account.' });
    }

    const googleId = payload.sub;
    const cleanEmail = payload.email.trim().toLowerCase();
    const name = payload.name || cleanEmail.split('@')[0] || 'IELTS Student';
    const avatar = payload.picture || '';

    // Link existing account by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: cleanEmail }],
    });

    if (user) {
      let modified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        modified = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email: cleanEmail,
        googleId,
        avatar,
        isVerified: true,
      });
    }

    res.json({ token: sign(user.id), user });
  } catch (err) {
    console.error('Google token verification error:', err);
    res.status(401).json({ message: 'Google authentication failed. Please try again.' });
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
