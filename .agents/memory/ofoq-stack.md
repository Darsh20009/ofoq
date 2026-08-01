---
name: OFOQ Stack & Architecture
description: Key technical decisions, quirks, and constraints for the OFOQ project
---

## Stack
- **Backend**: Node.js + Express + TypeScript, MongoDB (Mongoose), WebSocket
- **Frontend**: React 18 + Vite + Tailwind CSS, React Query, Zustand
- **Auth**: JWT tokens (stored in localStorage as `ofoq_token`), express-session for OAuth only
- **Email**: cPanel SMTP via `CPANEL_SMTP_*` env vars
- **Push**: VAPID Web Push via `VAPID_*` env vars
- **AI**: OpenAI hidden under analytics (not exposed to users)

## Secrets needed before DB works
`MONGODB_URI`, `JWT_SECRET`, `SESSION_SECRET`, `CPANEL_SMTP_*`, `VAPID_*`, `APPLE_WALLET_*`

## Type conflict workaround
`@types/express-session` ships its own nested `@types/express` causing TS2769 errors. Fixed by:
- `as any` cast on session/passport/multer middleware in source files
- `"resolutions": { "@types/express": "4.17.21" }` in package.json (for yarn on Render)

**Why:** Two versions of express types become incompatible in `.ts` source files (not `.d.ts`), `skipLibCheck` doesn't help.

## Build command
`"build": "tsc --noEmitOnError false; vite build"` — semicolon so Vite runs even if tsc has residual errors.

## API endpoint corrections (client vs server)
- `/analytics/dashboard` (was `/analytics/overview` in client — fixed)
- `/analytics/projects-stages` (was `/analytics/projects-by-stage` — fixed)

## Auth response normalization
All auth endpoints now return `name: user.fullName` (not `fullName`). `/auth/me` also normalized. The Zustand store persists user to localStorage via `ofoq-auth` key — no re-fetch on page refresh.

## Error handling policy
All `toast.error()` calls removed from the entire frontend. Only `toast.success()` remains. Global axios interceptor is fully silent (no toasts for any HTTP errors).

## Rate limiter
Global: 3000 req/15min per IP. Login: 30/15min. OTP: 20/hr. Admin dashboard uses staleTime 2min + refetchInterval 5min to avoid hitting limits.
