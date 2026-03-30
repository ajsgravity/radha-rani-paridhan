// ── Environment Config ─────────────────────────
// Validates all env vars on startup
require('dotenv').config();
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/radharani'),
  JWT_SECRET: z.string().min(32).default('dev-jwt-secret-key-that-is-at-least-32-characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  REFRESH_TOKEN_SECRET: z.string().min(32).default('dev-refresh-secret-key-that-is-at-least-32-characters'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  ADMIN_EMAIL: z.string().email().default('admin@radharani.in'),
  ADMIN_SECRET_KEY_HASH: z.string().optional(),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().default('products_upload'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

module.exports = { env: parsed.data };
