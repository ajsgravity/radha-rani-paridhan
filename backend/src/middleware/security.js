// ── Security Middleware ──────────────────────────
const rateLimit = require('express-rate-limit');
const { verifyAccessToken } = require('../utils/jwt');

// ─ Rate Limiters ─
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Try again later.' },
});

// ─ Auth Guard ─
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const decoded = verifyAccessToken(authHeader.slice(7));
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─ Zod Validation ─
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.issues.map(i => ({ path: i.path, message: i.message })),
      });
    }
    req.body = result.data; // use sanitized data
    next();
  };
}

module.exports = { globalLimiter, loginLimiter, requireAuth, validate };
