const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

module.exports = async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
};
