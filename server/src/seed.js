const Task = require('./models/Task');
const { buildTasks } = require('./data/curriculum');

/** Idempotent: upserts all tasks by their stable number. Progress is never touched. */
async function seedTasks() {
  const tasks = buildTasks();
  await Task.bulkWrite(
    tasks.map((t) => ({
      updateOne: { filter: { number: t.number }, update: { $set: t }, upsert: true },
    }))
  );
  await Task.deleteMany({ number: { $gt: tasks.length } });
  console.log(`Curriculum ready: ${tasks.length} tasks`);
  return tasks.length;
}

module.exports = { seedTasks };

// `npm run seed`
if (require.main === module) {
  const mongoose = require('mongoose');
  const connectDB = require('./db');
  connectDB()
    .then(seedTasks)
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
