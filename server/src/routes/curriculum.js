const router = require('express').Router();
const Task = require('../models/Task');
const { PHASES } = require('../data/curriculum');

// Public: the curriculum is the same for every student.
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ number: 1 }).select('-_id').lean();
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ phases: PHASES, tasks });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
