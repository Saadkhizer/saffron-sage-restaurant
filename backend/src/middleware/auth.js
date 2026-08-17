import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production. Refusing to start with an insecure default.');
  }
  console.warn('⚠️  JWT_SECRET not set — using an insecure development-only secret. Set JWT_SECRET before deploying.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role || 'customer' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Hard guard: rejects the request if there is no valid token.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// Restrict a route to a specific role (e.g. 'owner' for the admin console).
// Must be used after requireAuth.
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Owner access required' });
    }
    next();
  };
}
