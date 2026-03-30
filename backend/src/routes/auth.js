// ── Auth Routes ─────────────────────────────────
const { Router } = require('express');
const { z } = require('zod');
const { verifyPassword } = require('../utils/hash');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { loginLimiter, validate } = require('../middleware/security');
const { env } = require('../config/env');

const router = Router();

const loginSchema = z.object({
  secretKey: z.string().min(1, 'Secret key is required'),
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { secretKey } = req.body;

    // If no hash set yet, use a demo mode
    if (!env.ADMIN_SECRET_KEY_HASH) {
      // Demo mode: any key works
      const accessToken = signAccessToken({ role: 'admin', email: env.ADMIN_EMAIL });
      const refreshToken = signRefreshToken({ role: 'admin', email: env.ADMIN_EMAIL });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/auth',
      });

      return res.json({ accessToken, expiresIn: env.JWT_EXPIRES_IN });
    }

    const isValid = await verifyPassword(secretKey, env.ADMIN_SECRET_KEY_HASH);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({ role: 'admin', email: env.ADMIN_EMAIL });
    const refreshToken = signRefreshToken({ role: 'admin', email: env.ADMIN_EMAIL });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return res.json({ accessToken, expiresIn: env.JWT_EXPIRES_IN });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const decoded = verifyRefreshToken(token);
    const accessToken = signAccessToken({ role: decoded.role, email: decoded.email });
    return res.json({ accessToken, expiresIn: env.JWT_EXPIRES_IN });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  return res.json({ message: 'Logged out' });
});

module.exports = router;
