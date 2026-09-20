const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { JWT_SECRET } = require('../config');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const sign = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

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

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      ...(typeof startDate === 'string' && DATE.test(startDate) ? { startDate } : {}),
    });
    res.status(201).json({ token: sign(user.id), user });
  } catch (err) {
    next(err);
  }
});

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
