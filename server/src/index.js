'use strict';

const fs = require('fs');
const path = require('path');
const app = require('./app');
const { PORT } = require('./config');
const connectDB = require('./db');
const { seedTasks } = require('./seed');

// Serve the built React app in production mode if running standalone
const dist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(dist)) {
  const express = require('express');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

(async () => {
  try {
    await connectDB();
    await seedTasks();
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Could not start the server:', err.message);
    console.error('Is MongoDB running? Check MONGODB_URI in server/.env');
    process.exit(1);
  }
})();
