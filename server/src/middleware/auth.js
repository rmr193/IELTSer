const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid session token. Please sign in again.' });
    }
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
};
