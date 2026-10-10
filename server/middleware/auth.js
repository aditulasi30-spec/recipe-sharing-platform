const jwt = require('jsonwebtoken');

// Requires a valid "Authorization: Bearer <token>" header
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Attaches req.userId if a valid token is present, but never blocks
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      /* ignore */
    }
  }
  next();
}

module.exports = { auth, optionalAuth };
