// ── DNS Fix (for ISPs that block SRV records e.g. Reliance) ─
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

// ── Radha Rani Paridhan — Backend Server ────────
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { env } = require('./config/env');
const { connectDB } = require('./config/db');
const { globalLimiter } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const orderRoutes = require('./routes/orders');

const app = express();

// ── Security Headers ────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", env.FRONTEND_URL],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── CORS ────────────────────────────────────────
// FRONTEND_URL can be comma-separated for multiple origins, e.g.:
// "https://radha-rani-paridhan.vercel.app,http://localhost:3000"
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean),
];

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parsing ─────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Logging ─────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate Limiting ───────────────────────────────
app.use(globalLimiter);

// ── Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ───────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('🔴 Server Error:', err);
  res.status(err.status || 500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start (connect DB first, then listen) ───────
async function start() {
  await connectDB(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    console.log(`\n✦ Radha Rani API running on http://localhost:${env.PORT}`);
    console.log(`  ├─ Auth:     /api/auth/login · /api/auth/refresh · /api/auth/logout`);
    console.log(`  ├─ Products: /api/products (GET, POST, PUT, DELETE)`);
    console.log(`  ├─ Orders:   /api/orders (GET, POST, PUT)`);
    console.log(`  ├─ Contact:  /api/contact`);
    console.log(`  └─ Health:   /api/health\n`);
  });
}

start();
