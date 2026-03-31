// ── Auth Routes ─────────────────────────────────
const { Router } = require('express');
const { z } = require('zod');
const { verifyPassword } = require('../utils/hash');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { loginLimiter, validate } = require('../middleware/security');
const { env } = require('../config/env');

const router = Router();

function isBcryptHash(value) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
}

const loginSchema = z.object({
  secretKey: z.string().min(1, 'Secret key is required'),
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const secretKey = req.body.secretKey.trim();

    // If no hash nor plain text key is set yet, use a demo mode
    if (!env.ADMIN_SECRET_KEY_HASH && !env.ADMIN_SECRET_KEY) {
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

    let isValid = false;
    
    // Check plaintext key if defined, else compare against bcrypt hash
    if (env.ADMIN_SECRET_KEY) {
      isValid = (secretKey === env.ADMIN_SECRET_KEY);
    } else if (env.ADMIN_SECRET_KEY_HASH) {
      // Accept both bcrypt hash and plain text for safer deployment recovery.
      // If hash is not a bcrypt hash format, fallback to plain comparison.
      if (isBcryptHash(env.ADMIN_SECRET_KEY_HASH)) {
        isValid = await verifyPassword(secretKey, env.ADMIN_SECRET_KEY_HASH);
      } else {
        isValid = (secretKey === env.ADMIN_SECRET_KEY_HASH);
      }
    } else {
      isValid = false;
    }
    
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
