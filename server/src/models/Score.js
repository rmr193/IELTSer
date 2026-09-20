const mongoose = require('mongoose');

const band = { type: Number, required: true, min: 0, max: 9 };

const scoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    type: { type: String, enum: ['mock', 'practice'], default: 'mock' },
    listening: band,
    reading: band,
    writing: band,
    speaking: band,
    overall: { type: Number, required: true },
    note: { type: String, trim: true, maxlength: 200, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.user;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Score', scoreSchema);
