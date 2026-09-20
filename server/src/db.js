'use strict';

const mongoose = require('mongoose');
const config = require('./config');

// Serverless-friendly global connection cache
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

module.exports = async function connectDB() {
  const uri = process.env.MONGODB_URI || config.MONGODB_URI;

  if (!uri || (process.env.NODE_ENV === 'production' && uri.includes('127.0.0.1'))) {
    throw new Error(
      'MONGODB_URI is not configured in Vercel Environment Variables. Please add your Atlas connection string.'
    );
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).then((m) => {
      console.log('MongoDB connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
