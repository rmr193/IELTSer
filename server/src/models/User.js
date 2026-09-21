const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const todayKey = () => new Date().toISOString().slice(0, 10);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    targetBand: { type: Number, default: 8, min: 4, max: 9 },
    // "YYYY-MM-DD" (calendar date chosen by the student)
    startDate: { type: String, default: todayKey, match: /^\d{4}-\d{2}-\d{2}$/ },
    // Google-authenticated accounts are verified by default
    isVerified: { type: Boolean, default: true },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
