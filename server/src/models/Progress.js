const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    task: { type: Number, required: true }, // Task.number
    completedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

progressSchema.index({ user: 1, task: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
