const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true }, // 1..449, stable id
    day: { type: Number, required: true, index: true },      // 1..90
    order: { type: Number, required: true },                 // position within the day
    phase: { type: Number, required: true },                 // 1..6
    skill: {
      type: String,
      enum: ['listening', 'reading', 'writing', 'speaking', 'language'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    minutes: { type: Number, required: true },
    dayTitle: { type: String },
    dayTip: { type: String },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Task', taskSchema);
