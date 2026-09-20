const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const todayKey = () => new Date().toISOString().slice(0, 10);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    targetBand: { type: Number, default: 8, min: 4, max: 9 },
    // "YYYY-MM-DD" (calendar date chosen by the student)
    startDate: { type: String, default: todayKey, match: /^\d{4}-\d{2}-\d{2}$/ },
    // Email verification fields
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    // Password reset fields
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
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
