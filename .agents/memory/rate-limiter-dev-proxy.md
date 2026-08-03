---
name: Rate limiter behind Replit dev proxy
description: Why global express-rate-limit caused sitewide 429s in dev and how it's handled
---
Global express-rate-limit (3000/15min per IP) is skipped entirely when `NODE_ENV !== "production"` in `server/middleware/rateLimiter.ts`.

**Why:** Behind the Replit dev proxy all visitors/screenshots share one IP, so the shared bucket gets exhausted during development and every request returns 429 — the site appears "down". `trust proxy` is set to 1 in `server/app.ts` for correct per-IP limiting in production.

**How to apply:** If sitewide 429s reappear, check the limiter first, not the frontend. Don't re-enable the global limiter in dev.
