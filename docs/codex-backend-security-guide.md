# Codex – End-to-End Secured Backend Guide
### Complete server architecture for the Codex code editor site

---

## Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment & Secrets Management](#4-environment--secrets-management)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [API Routes & Controllers](#7-api-routes--controllers)
8. [Plugin/Product CRUD](#8-pluginproduct-crud)
9. [Analytics Endpoints](#9-analytics-endpoints)
10. [Admin Guard Middleware](#10-admin-guard-middleware)
11. [Rate Limiting & Brute Force Protection](#11-rate-limiting--brute-force-protection)
12. [Input Validation & Sanitization](#12-input-validation--sanitization)
13. [CORS, Helmet & Security Headers](#13-cors-helmet--security-headers)
14. [File Upload Security](#14-file-upload-security)
15. [Logging & Monitoring](#15-logging--monitoring)
16. [Deployment & CI/CD](#16-deployment--cicd)
17. [Security Checklist](#17-security-checklist)

---

## 1. Architecture Overview

```
                        INTERNET
                            │
                    ┌───────▼────────┐
                    │   Cloudflare   │  DDoS protection, WAF, CDN
                    └───────┬────────┘
                            │ HTTPS only
                    ┌───────▼────────┐
                    │   Nginx        │  Reverse proxy, rate limit,
                    │   (port 443)   │  SSL termination
                    └───────┬────────┘
                            │
               ┌────────────┼────────────┐
               │            │            │
       ┌───────▼──┐  ┌──────▼───┐  ┌────▼──────┐
       │  Next.js │  │ Express  │  │  Static   │
       │  Frontend│  │  API     │  │  Assets   │
       │  (3000)  │  │  (4000)  │  │  (S3/CDN) │
       └──────────┘  └──────┬───┘  └───────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼───┐  ┌──────▼───┐  ┌─────▼──────┐
       │ Postgres │  │  Redis   │  │  S3 Bucket │
       │  (main   │  │ (sessions│  │  (uploads) │
       │   DB)    │  │  cache)  │  │            │
       └──────────┘  └──────────┘  └────────────┘
```

**Request lifecycle:**

```
Browser → Cloudflare WAF → Nginx (rate limit) → Express middleware stack
       → Auth check → Role check → Route handler → DB query → Response
```

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js 20 LTS | Stable, fast, huge ecosystem |
| Framework | Express.js 5 | Minimal, flexible, battle-tested |
| Language | TypeScript | Type safety, fewer runtime bugs |
| Database | PostgreSQL 16 | Relational, ACID, full-text search |
| ORM | Prisma | Type-safe queries, auto migrations |
| Cache / Sessions | Redis 7 | Fast session store, rate-limit counters |
| Auth | JWT + httpOnly cookies | Stateless tokens, XSS-proof storage |
| Password hashing | bcrypt (cost 12) | Industry standard, slow by design |
| Validation | Zod | Schema-first, TypeScript-native |
| File storage | AWS S3 + presigned URLs | Scalable, never expose AWS keys to client |
| Reverse proxy | Nginx | SSL, rate limit, gzip |
| Process manager | PM2 | Auto-restart, clustering |
| Logging | Winston + Morgan | Structured logs, request tracing |
| Monitoring | Sentry + Prometheus | Error tracking, metrics |

---

## 3. Project Structure

```
codex-backend/
├── src/
│   ├── server.ts               # Entry point
│   ├── app.ts                  # Express app setup
│   ├── config/
│   │   ├── env.ts              # Validated env vars (Zod)
│   │   ├── database.ts         # Prisma client singleton
│   │   └── redis.ts            # Redis client singleton
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   ├── adminGuard.ts       # Owner-only route guard
│   │   ├── rateLimiter.ts      # Per-route rate limits
│   │   ├── validate.ts         # Zod schema validator
│   │   ├── errorHandler.ts     # Global error handler
│   │   └── requestLogger.ts    # Morgan + Winston
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── plugins/
│   │   │   ├── plugins.router.ts
│   │   │   ├── plugins.controller.ts
│   │   │   └── plugins.service.ts
│   │   ├── analytics/
│   │   │   ├── analytics.router.ts
│   │   │   ├── analytics.controller.ts
│   │   │   └── analytics.service.ts
│   │   └── uploads/
│   │       ├── uploads.router.ts
│   │       └── uploads.service.ts
│   └── utils/
│       ├── jwt.ts
│       ├── hash.ts
│       └── logger.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── auth.test.ts
│   └── plugins.test.ts
├── .env                        # NEVER commit this
├── .env.example                # Commit this (empty values)
├── .gitignore
├── docker-compose.yml
└── package.json
```

---

## 4. Environment & Secrets Management

### `.env.example` (commit this, never `.env`)

```bash
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/codex_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=                    # min 64 random chars
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_SECRET=          # different from JWT_SECRET
REFRESH_TOKEN_EXPIRES_IN=30d

# Admin
ADMIN_EMAIL=                   # owner email
ADMIN_SECRET_KEY_HASH=         # bcrypt hash of owner's secret key

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# Sentry
SENTRY_DSN=
```

### `src/config/env.ts` — Validate all env vars on startup

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("8h"),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_SECRET_KEY_HASH: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),
  SENTRY_DSN: z.string().optional(),
});

// Crash immediately on startup if any env var is missing
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

---

## 5. Database Schema

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Users ───────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  refreshTokens RefreshToken[]
  installs      Install[]

  @@index([email])
}

enum Role {
  USER
  OWNER
}

// ── Refresh tokens (stored in DB for revocation) ─
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  revoked   Boolean  @default(false)

  @@index([userId])
}

// ── Plugins / Products ──────────────────────────
model Plugin {
  id          String      @id @default(cuid())
  name        String      @unique
  slug        String      @unique
  description String
  category    String
  price       Float       @default(0)
  imageUrl    String?
  repoUrl     String?
  version     String      @default("1.0.0")
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  installs    Install[]
  analytics   PluginAnalytics[]

  @@index([category])
  @@index([isActive])
}

// ── Installs (tracks who installed what) ─────────
model Install {
  id        String   @id @default(cuid())
  pluginId  String
  plugin    Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  installedAt DateTime @default(now())

  @@index([pluginId])
  @@index([userId])
}

// ── Analytics (daily aggregates) ─────────────────
model PluginAnalytics {
  id        String   @id @default(cuid())
  pluginId  String
  plugin    Plugin   @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  views     Int      @default(0)
  installs  Int      @default(0)
  revenue   Float    @default(0)

  @@unique([pluginId, date])
  @@index([date])
}

// ── Contact form submissions ──────────────────────
model ContactSubmission {
  id        String   @id @default(cuid())
  firstName String
  lastName  String
  email     String
  teamSize  String?
  subject   String
  message   String
  createdAt DateTime @default(now())
  read      Boolean  @default(false)
}
```

### Run migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 6. Authentication System

### `src/utils/hash.ts`

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // Deliberately slow — increase as hardware improves

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

### `src/utils/jwt.ts`

```typescript
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
  userId: string;
  role: "USER" | "OWNER";
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: "codex-api",
    audience: "codex-client",
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    issuer: "codex-api",
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: "codex-api",
    audience: "codex-client",
  }) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET, {
    issuer: "codex-api",
  }) as TokenPayload;
}
```

### `src/modules/auth/auth.service.ts`

```typescript
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { env } from "../../config/env";

export async function loginOwner(email: string, secretKey: string) {
  // 1. Check owner email matches env-configured admin
  if (email !== env.ADMIN_EMAIL) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // 2. Verify secret key against stored bcrypt hash
  const valid = await verifyPassword(secretKey, env.ADMIN_SECRET_KEY_HASH);
  if (!valid) throw new Error("INVALID_CREDENTIALS");

  // 3. Find or create owner user record
  const user = await prisma.user.upsert({
    where: { email },
    update: { lastLoginAt: new Date() },
    create: {
      email,
      passwordHash: env.ADMIN_SECRET_KEY_HASH,
      role: "OWNER",
      lastLoginAt: new Date(),
    },
  });

  // 4. Issue tokens
  const payload = { userId: user.id, role: user.role as "OWNER" };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 5. Store refresh token in DB (allows revocation)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken, user: { id: user.id, email, role: user.role } };
}

export async function refreshSession(oldRefreshToken: string) {
  // 1. Verify JWT signature
  const payload = verifyRefreshToken(oldRefreshToken);

  // 2. Check token exists in DB and is not revoked
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // 3. Rotate: revoke old token, issue new pair (refresh token rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const newAccessToken = signAccessToken({ userId: payload.userId, role: payload.role });
  const newRefreshToken = signRefreshToken({ userId: payload.userId, role: payload.role });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.userId, expiresAt },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function revokeSession(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

export async function revokeAllSessions(userId: string) {
  // Revoke every token for this user — useful if compromise suspected
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
  // Also blacklist access tokens in Redis until they expire naturally
  await redis.set(`blacklist:user:${userId}`, "1", "EX", 8 * 60 * 60);
}
```

### `src/modules/auth/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, secretKey } = req.body;
    const result = await authService.loginOwner(email, secretKey);

    // Access token goes in httpOnly cookie (XSS-proof)
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    // Refresh token in a separate httpOnly cookie
    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh", // only sent to this specific endpoint
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ user: result.user });
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      // Generic message — never reveal whether email or key was wrong
      return res.status(401).json({ error: "Invalid credentials" });
    }
    next(err);
  }
}

// POST /api/auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const result = await authService.refreshSession(token);

    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Session refreshed" });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refresh_token;
    if (token) await authService.revokeSession(token);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
}
```

---

## 7. API Routes & Controllers

### `src/modules/auth/auth.router.ts`

```typescript
import { Router } from "express";
import { login, logout, refresh } from "./auth.controller";
import { loginRateLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { z } from "zod";

export const authRouter = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    secretKey: z.string().min(8).max(256),
  }),
});

authRouter.post("/login", loginRateLimiter, validate(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
```

### `src/app.ts` — Main Express app

```typescript
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { globalRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { authRouter } from "./modules/auth/auth.router";
import { pluginsRouter } from "./modules/plugins/plugins.router";
import { analyticsRouter } from "./modules/analytics/analytics.router";
import { uploadsRouter } from "./modules/uploads/uploads.router";

const app = express();

// ── Security headers (must be first) ─────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", `https://${env.AWS_S3_BUCKET}.s3.amazonaws.com`],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// ── CORS ──────────────────────────────────────────
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,           // required for cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "X-CSRF-Token"],
}));

// ── Body parsing ──────────────────────────────────
app.use(express.json({ limit: "10kb" }));  // reject large payloads
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());

// ── Rate limiting & logging ───────────────────────
app.use(globalRateLimiter);
app.use(requestLogger);

// ── Routes ────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/plugins", pluginsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/uploads", uploadsRouter);

// ── Health check (no auth) ────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

// ── 404 catch ─────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: "Not found" }));

// ── Global error handler (must be last) ──────────
app.use(errorHandler);

export default app;
```

---

## 8. Plugin/Product CRUD

### `src/modules/plugins/plugins.router.ts`

```typescript
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { adminGuard } from "../../middleware/adminGuard";
import { validate } from "../../middleware/validate";
import { apiRateLimiter } from "../../middleware/rateLimiter";
import * as ctrl from "./plugins.controller";
import { z } from "zod";

export const pluginsRouter = Router();

const pluginSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().min(10).max(500),
    category: z.enum(["Language", "Formatter", "AI", "Git", "Theme", "Other"]),
    price: z.number().min(0).max(999),
    repoUrl: z.string().url().optional(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  }),
});

// Public routes
pluginsRouter.get("/", apiRateLimiter, ctrl.listPlugins);
pluginsRouter.get("/:slug", apiRateLimiter, ctrl.getPlugin);

// Owner-only routes (auth + role check)
pluginsRouter.post(
  "/",
  authMiddleware,
  adminGuard,
  validate(pluginSchema),
  ctrl.createPlugin
);

pluginsRouter.patch(
  "/:id",
  authMiddleware,
  adminGuard,
  validate(pluginSchema.deepPartial()),
  ctrl.updatePlugin
);

pluginsRouter.delete(
  "/:id",
  authMiddleware,
  adminGuard,
  ctrl.deletePlugin
);

pluginsRouter.patch(
  "/:id/toggle",
  authMiddleware,
  adminGuard,
  ctrl.togglePluginStatus
);
```

### `src/modules/plugins/plugins.service.ts`

```typescript
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";

const CACHE_TTL = 60; // seconds

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getAllPlugins(activeOnly = true) {
  const cacheKey = `plugins:list:${activeOnly}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const plugins = await prisma.plugin.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, description: true,
      category: true, price: true, imageUrl: true,
      version: true, isActive: true, createdAt: true,
      _count: { select: { installs: true } },
    },
  });

  await redis.set(cacheKey, JSON.stringify(plugins), "EX", CACHE_TTL);
  return plugins;
}

export async function getPluginBySlug(slug: string) {
  const cacheKey = `plugins:slug:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const plugin = await prisma.plugin.findUnique({
    where: { slug },
    include: { _count: { select: { installs: true } } },
  });

  if (plugin) await redis.set(cacheKey, JSON.stringify(plugin), "EX", CACHE_TTL);
  return plugin;
}

async function invalidatePluginCache() {
  // Clear all plugin cache keys on write operations
  const keys = await redis.keys("plugins:*");
  if (keys.length) await redis.del(...keys);
}

export async function createPlugin(data: {
  name: string; description: string; category: string;
  price: number; repoUrl?: string; version?: string;
}) {
  const slug = slugify(data.name);
  const plugin = await prisma.plugin.create({
    data: { ...data, slug },
  });
  await invalidatePluginCache();
  return plugin;
}

export async function updatePlugin(id: string, data: Partial<{
  name: string; description: string; category: string;
  price: number; repoUrl: string; version: string; isActive: boolean;
}>) {
  const plugin = await prisma.plugin.update({
    where: { id },
    data: {
      ...data,
      ...(data.name ? { slug: slugify(data.name) } : {}),
    },
  });
  await invalidatePluginCache();
  return plugin;
}

export async function deletePlugin(id: string) {
  await prisma.plugin.delete({ where: { id } });
  await invalidatePluginCache();
}

export async function toggleStatus(id: string) {
  const plugin = await prisma.plugin.findUniqueOrThrow({ where: { id } });
  const updated = await prisma.plugin.update({
    where: { id },
    data: { isActive: !plugin.isActive },
  });
  await invalidatePluginCache();
  return updated;
}
```

---

## 9. Analytics Endpoints

### `src/modules/analytics/analytics.service.ts`

```typescript
import { prisma } from "../../config/database";

export async function getDashboardStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalInstalls,
    weekInstalls,
    prevWeekInstalls,
    activeUsers,
    totalPlugins,
    activePlugins,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.install.count(),
    prisma.install.count({ where: { installedAt: { gte: weekAgo } } }),
    prisma.install.count({
      where: {
        installedAt: {
          gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: weekAgo,
        },
      },
    }),
    prisma.user.count({ where: { lastLoginAt: { gte: monthAgo } } }),
    prisma.plugin.count(),
    prisma.plugin.count({ where: { isActive: true } }),
    prisma.pluginAnalytics.aggregate({
      _sum: { revenue: true },
      where: { date: { gte: monthAgo } },
    }),
  ]);

  const installGrowth = prevWeekInstalls > 0
    ? (((weekInstalls - prevWeekInstalls) / prevWeekInstalls) * 100).toFixed(1)
    : null;

  return {
    totalInstalls,
    weekInstalls,
    installGrowth,
    activeUsers,
    totalPlugins,
    activePlugins,
    revenueThisMonth: revenueThisMonth._sum.revenue ?? 0,
  };
}

export async function getWeeklyInstalls() {
  const results = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
    SELECT
      TO_CHAR(DATE_TRUNC('day', "installedAt"), 'Dy') AS day,
      COUNT(*) AS count
    FROM "Install"
    WHERE "installedAt" >= NOW() - INTERVAL '7 days'
    GROUP BY DATE_TRUNC('day', "installedAt"), day
    ORDER BY DATE_TRUNC('day', "installedAt")
  `;
  return results.map(r => ({ day: r.day, count: Number(r.count) }));
}

export async function getTopPlugins(limit = 10) {
  return prisma.plugin.findMany({
    take: limit,
    orderBy: { installs: { _count: "desc" } },
    select: {
      id: true, name: true, category: true, price: true, isActive: true,
      _count: { select: { installs: true } },
      analytics: {
        select: { revenue: true },
        where: {
          date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
    },
  });
}

// Called on each plugin install — upserts daily aggregate
export async function recordInstall(pluginId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.$transaction([
    prisma.pluginAnalytics.upsert({
      where: { pluginId_date: { pluginId, date: today } },
      update: { installs: { increment: 1 } },
      create: { pluginId, date: today, installs: 1 },
    }),
    prisma.install.create({ data: { pluginId } }),
  ]);
}
```

### `src/modules/analytics/analytics.router.ts`

```typescript
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { adminGuard } from "../../middleware/adminGuard";
import * as ctrl from "./analytics.controller";

export const analyticsRouter = Router();

// All analytics routes require owner auth
analyticsRouter.use(authMiddleware, adminGuard);

analyticsRouter.get("/dashboard", ctrl.dashboard);
analyticsRouter.get("/weekly-installs", ctrl.weeklyInstalls);
analyticsRouter.get("/top-plugins", ctrl.topPlugins);
```

---

## 10. Admin Guard Middleware

### `src/middleware/auth.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { redis } from "../config/redis";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Read token from httpOnly cookie (never from Authorization header for admin)
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = verifyAccessToken(token);

    // Check if user has been globally revoked (e.g. after compromise)
    const blacklisted = await redis.get(`blacklist:user:${payload.userId}`);
    if (blacklisted) {
      return res.status(401).json({ error: "Session invalidated" });
    }

    // Attach user info to request for downstream middleware
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

### `src/middleware/adminGuard.ts`

```typescript
import { Request, Response, NextFunction } from "express";

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "OWNER") {
    // Log unauthorized access attempt
    console.warn(`[SECURITY] Unauthorized admin access attempt by user ${req.user.userId} from IP ${req.ip}`);
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}
```

### Type augmentation for `req.user`

```typescript
// src/types/express.d.ts
import { TokenPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
```

---

## 11. Rate Limiting & Brute Force Protection

### `src/middleware/rateLimiter.ts`

```typescript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis";

// Global limiter — applies to every route
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args: string[]) => redis.call(...args) }),
  message: { error: "Too many requests, please try again later" },
  skip: (req) => req.path === "/health",
});

// Strict limiter for login — prevents brute force
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // only 5 login attempts per 15 minutes per IP
  store: new RedisStore({ sendCommand: (...args: string[]) => redis.call(...args) }),
  message: { error: "Too many login attempts. Try again in 15 minutes." },
  keyGenerator: (req) => `login:${req.ip}:${req.body?.email || ""}`,
  handler: (req, res) => {
    console.warn(`[SECURITY] Login rate limit hit from IP ${req.ip}`);
    res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
  },
});

// Standard API limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 60,
  store: new RedisStore({ sendCommand: (...args: string[]) => redis.call(...args) }),
});
```

---

## 12. Input Validation & Sanitization

### `src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import DOMPurify from "isomorphic-dompurify";

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize all string inputs against XSS before validation
      if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
      }

      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = result.body;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          error: "Validation failed",
          issues: err.errors.map(e => ({ path: e.path.join("."), message: e.message })),
        });
      }
      next(err);
    }
  };
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string") {
      result[key] = DOMPurify.sanitize(val.trim());
    } else if (typeof val === "object" && val !== null) {
      result[key] = sanitizeObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}
```

### SQL injection prevention

Prisma uses parameterized queries by default. For raw queries, always use tagged template literals:

```typescript
// ✅ SAFE — parameters are bound, never interpolated
const results = await prisma.$queryRaw`
  SELECT * FROM "Plugin" WHERE slug = ${slug}
`;

// ❌ DANGEROUS — never do this
const results = await prisma.$queryRawUnsafe(
  `SELECT * FROM "Plugin" WHERE slug = '${slug}'`
);
```

---

## 13. CORS, Helmet & Security Headers

Headers sent on every response (configured via Helmet in `app.ts`):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Add Permissions-Policy (not in Helmet by default)

```typescript
app.use((_, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
});
```

---

## 14. File Upload Security

Plugin icons and images are uploaded via **presigned S3 URLs** — the client uploads directly to S3, the server never handles the binary file data.

### `src/modules/uploads/uploads.service.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

type AllowedMimeType = typeof ALLOWED_TYPES[number];

export async function getPresignedUploadUrl(
  mimeType: string,
  fileSize: number
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {

  // Validate mime type server-side — never trust client
  if (!ALLOWED_TYPES.includes(mimeType as AllowedMimeType)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const ext = mimeType.split("/")[1];
  const key = `plugins/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: mimeType,
    ContentLength: fileSize,
    // Prevent overwriting other files
    IfNoneMatch: "*",
  });

  // Presigned URL expires in 5 minutes
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
}

export async function deleteFile(key: string) {
  await s3.send(new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  }));
}
```

### Client-side upload flow

```javascript
// 1. Ask server for a presigned URL
const { uploadUrl, fileUrl } = await fetch("/api/uploads/presign", {
  method: "POST",
  body: JSON.stringify({ mimeType: file.type, fileSize: file.size }),
  headers: { "Content-Type": "application/json" },
  credentials: "include",
}).then(r => r.json());

// 2. Upload directly to S3 (server never sees the file)
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});

// 3. Save the public fileUrl to your plugin record
```

---

## 15. Logging & Monitoring

### `src/utils/logger.ts`

```typescript
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "codex-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
```

### `src/middleware/requestLogger.ts`

```typescript
import morgan from "morgan";
import { logger } from "../utils/logger";

// Log every request with IP, method, path, status, response time
export const requestLogger = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms",
  {
    stream: { write: (msg) => logger.http(msg.trim()) },
    // Skip health checks from logs to reduce noise
    skip: (req) => req.url === "/health",
  }
);
```

### `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { logger } from "../utils/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Report to Sentry in production
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(err);
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.userId,
  });

  // Never expose internal error details to client
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Internal server error";

  res.status(status).json({ error: message });
}
```

---

## 16. Deployment & CI/CD

### `docker-compose.yml` (local development)

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: codex_db
      POSTGRES_USER: codex
      POSTGRES_PASSWORD: dev_password_change_me
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass dev_redis_password

  api:
    build: .
    ports:
      - "4000:4000"
    env_file: .env
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

### Nginx config (`/etc/nginx/sites-available/codex`)

```nginx
server {
    listen 443 ssl http2;
    server_name api.codex.dev;

    ssl_certificate     /etc/letsencrypt/live/api.codex.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.codex.dev/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Rate limit at Nginx level (first line of defense)
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Hide Nginx version
    server_tokens off;

    location / {
        proxy_pass         http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }
}

# Force HTTPS
server {
    listen 80;
    server_name api.codex.dev;
    return 301 https://$host$request_uri;
}
```

### GitHub Actions CI (`/.github/workflows/deploy.yml`)

```yaml
name: Deploy API

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: codex_test
          POSTGRES_USER: codex
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: --health-cmd "redis-cli ping"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
        env:
          DATABASE_URL: postgresql://codex:test_password@localhost:5432/codex_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          REFRESH_TOKEN_SECRET: ${{ secrets.REFRESH_TOKEN_SECRET }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /srv/codex-api
            git pull origin main
            npm ci --production
            npx prisma migrate deploy
            pm2 restart codex-api
```

---

## 17. Security Checklist

### Authentication & Sessions

| # | Control | Implementation |
|---|---|---|
| 1 | Passwords hashed with bcrypt cost 12 | `bcrypt.hash(plain, 12)` |
| 2 | Tokens in httpOnly cookies, not localStorage | `res.cookie(..., { httpOnly: true })` |
| 3 | Access token short-lived (8h) | `JWT_EXPIRES_IN=8h` |
| 4 | Refresh token rotation on use | Old token revoked, new one issued |
| 5 | Refresh tokens stored in DB for revocation | `RefreshToken` table with `revoked` flag |
| 6 | Global revocation via Redis blacklist | `blacklist:user:{id}` key |
| 7 | Generic error messages on login failure | Never reveal which field was wrong |

### Transport & Headers

| # | Control | Implementation |
|---|---|---|
| 8 | HTTPS enforced (HSTS preload) | Nginx redirect + HSTS header |
| 9 | TLS 1.2+ only | `ssl_protocols TLSv1.2 TLSv1.3` |
| 10 | Content Security Policy | Helmet CSP middleware |
| 11 | CORS locked to frontend origin | `cors({ origin: env.FRONTEND_URL })` |
| 12 | Clickjacking protection | `X-Frame-Options: DENY` |
| 13 | MIME sniffing prevention | `X-Content-Type-Options: nosniff` |

### Input & Data

| # | Control | Implementation |
|---|---|---|
| 14 | All inputs validated with Zod schemas | `validate()` middleware |
| 15 | XSS sanitization before validation | `DOMPurify.sanitize()` on all strings |
| 16 | SQL injection prevention | Prisma parameterized queries |
| 17 | Request body size limited | `express.json({ limit: "10kb" })` |
| 18 | File type validated server-side | MIME type allowlist in uploads service |
| 19 | Files never touch API server | Direct S3 presigned URL upload |

### Rate Limiting

| # | Control | Implementation |
|---|---|---|
| 20 | Global rate limit | 300 req/15min per IP |
| 21 | Login rate limit (brute force) | 5 attempts/15min per IP+email |
| 22 | API rate limit | 60 req/min per IP |
| 23 | Nginx-level limit | 10 req/s burst 20 |

### Secrets & Config

| # | Control | Implementation |
|---|---|---|
| 24 | Env vars validated at startup | Zod schema, process exits on missing vars |
| 25 | `.env` never committed | `.gitignore` + `.env.example` pattern |
| 26 | Secrets in CI via GitHub Secrets | Never hardcoded in code or Docker images |
| 27 | DB credentials rotated in production | Separate read/write DB users |

### Monitoring

| # | Control | Implementation |
|---|---|---|
| 28 | All errors reported to Sentry | `Sentry.captureException()` in error handler |
| 29 | Structured request logging | Morgan + Winston |
| 30 | Security events logged | Unauthorized access, rate limit hits |
| 31 | Health check endpoint | `GET /health` — no auth, monitored by uptime tool |

---

> **Recommended production stack**: Railway or Render for hosting · Supabase for managed Postgres · Upstash for serverless Redis · Cloudflare for WAF + CDN · GitHub Actions for CI/CD. Total cost for a small to medium product: under $50/month.
