'use strict';

const app = require('../server/src/app');
const connectDB = require('../server/src/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return res.status(500).json({
      message: err.message || 'Failed to connect to database',
    });
  }
  return app(req, res);
};
