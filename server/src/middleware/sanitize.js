'use strict';

/**
 * Recursively strips keys that start with '$' or contain '.'
 * to prevent MongoDB query operator injection attacks.
 */
function clean(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(clean);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip keys starting with $ or containing a dot
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = clean(value);
  }
  return sanitized;
}

module.exports = function sanitize(req, res, next) {
  if (req.body) req.body = clean(req.body);
  if (req.query) req.query = clean(req.query);
  if (req.params) req.params = clean(req.params);
  next();
};
