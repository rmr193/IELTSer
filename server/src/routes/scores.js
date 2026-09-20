const mongoose = require('mongoose');
const router = require('express').Router();
const Score = require('../models/Score');
const auth = require('../middleware/auth');

router.use(auth);

const DATE = /^\d{4}-\d{2}-\d{2}$/;
// IELTS rounds the average of the four skills to the nearest half band
const overallOf = (a, b, c, d) => Math.round(((a + b + c + d) / 4) * 2) / 2;

router.get('/', async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.userId }).sort({ date: 1, createdAt: 1 });
    res.json(scores);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { date, type, note } = req.body;
    const parts = ['listening', 'reading', 'writing', 'speaking'].map((k) => Number(req.body[k]));
    if (!DATE.test(date || '')) return res.status(400).json({ message: 'Choose a valid date.' });
    if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 9)) {
      return res.status(400).json({ message: 'Each band score must be between 0 and 9.' });
    }
    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 200) : '';
    const [listening, reading, writing, speaking] = parts;
    const score = await Score.create({
      user: req.userId,
      date,
      type: type === 'practice' ? 'practice' : 'mock',
      listening,
      reading,
      writing,
      speaking,
      overall: overallOf(...parts),
      note: cleanNote,
    });
    res.status(201).json(score);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid score ID format.' });
    }
    const result = await Score.deleteOne({ _id: id, user: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Score not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
