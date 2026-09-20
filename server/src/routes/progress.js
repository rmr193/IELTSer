const router = require('express').Router();
const Progress = require('../models/Progress');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// All completed tasks for the signed-in student
router.get('/', async (req, res, next) => {
  try {
    const rows = await Progress.find({ user: req.userId }).select('task completedAt -_id').lean();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Mark one task done / not done
router.put('/task/:number', async (req, res, next) => {
  try {
    const number = parseInt(req.params.number, 10);
    if (!Number.isInteger(number) || number < 1 || number > 449 || !(await Task.exists({ number }))) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    if (req.body.done) {
      await Progress.updateOne(
        { user: req.userId, task: number },
        { $setOnInsert: { completedAt: new Date() } },
        { upsert: true }
      );
    } else {
      await Progress.deleteOne({ user: req.userId, task: number });
    }
    res.json({ task: number, done: !!req.body.done });
  } catch (err) {
    next(err);
  }
});

// Mark every task of a day done / not done
router.put('/day/:day', async (req, res, next) => {
  try {
    const day = parseInt(req.params.day, 10);
    if (!Number.isInteger(day) || day < 1 || day > 90) {
      return res.status(404).json({ message: 'Day must be between 1 and 90.' });
    }
    const tasks = await Task.find({ day }).select('number -_id').lean();
    if (!tasks.length) return res.status(404).json({ message: 'Day not found.' });
    const numbers = tasks.map((t) => t.number);
    if (req.body.done) {
      const now = new Date();
      await Progress.bulkWrite(
        numbers.map((n) => ({
          updateOne: {
            filter: { user: req.userId, task: n },
            update: { $setOnInsert: { completedAt: now } },
            upsert: true,
          },
        }))
      );
    } else {
      await Progress.deleteMany({ user: req.userId, task: { $in: numbers } });
    }
    res.json({ day, tasks: numbers, done: !!req.body.done });
  } catch (err) {
    next(err);
  }
});

// Start over
router.delete('/', async (req, res, next) => {
  try {
    await Progress.deleteMany({ user: req.userId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
