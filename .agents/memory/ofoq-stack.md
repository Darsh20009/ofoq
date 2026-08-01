---
name: OFOQ Stack & Architecture
description: Core stack, secrets needed, key architectural decisions for OFOQ backend
---

## Stack
- Node.js + Express + TypeScript (tsx watch in dev)
- MongoDB Atlas via Mongoose
- WebSocket (/ws) for real-time notifications
- Background scheduler for cron tasks
- Port 5000 (backend), 3000 (frontend Vite dev server)

## Auth layers
1. JWT (localStorage key `ofoq_token`) — standard email/password
2. 2FA: TOTP (speakeasy) + email OTP + push — all implemented end-to-end
3. WebAuthn/Passkey — @simplewebauthn/server v13.3.2
4. Google OAuth — passport-google-oauth20, GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET
5. Apple OAuth — passport-apple, APPLE_* secrets
6. Barcode/QR login — POST /api/auth/barcode-login with employeeCode field on User

## Employee system (added)
- `employeeCode` field on User model (sparse unique, format: OFOQ-XXXXXXXX)
- Auto-generated on first access to /api/employee/me/card
- Routes at /api/employee/me/card, /me/regenerate-code, /me/wallet-pass
- Apple Wallet pass generation gated on APPLE_WALLET_CERT env var
- Barcode login: POST /api/auth/barcode-login { code } → JWT
- Employee role → redirected to /admin/employee/dashboard after login

## Secrets needed before app works
- MONGODB_URI — MongoDB Atlas connection string
- JWT_SECRET — for signing JWTs
- SESSION_SECRET — for Express sessions
- VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY — for web push
- CPANEL_SMTP_* — for email sending
- GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET — Google OAuth (added this session)
- APPLE_CLIENT_ID + APPLE_TEAM_ID + APPLE_KEY_ID + APPLE_PRIVATE_KEY — Apple OAuth (added)
- APPLE_WALLET_CERT — Apple Wallet pass type certificate (not yet added)

## WebAuthn
- RP ID and origin derived per-request from req.hostname (not static APP_URL)
- Works across Replit dev domain, ofoqhc.com, etc.

**Why:** Using req.hostname prevents broken WebAuthn when switching between dev/prod domains.

## OAuth callback URIs needed in Google Console
- http://localhost:5000/api/auth/google/callback (dev local)
- https://<replit-dev-domain>.replit.dev/api/auth/google/callback
- https://ofoqhc.com/api/auth/google/callback (production)
Note: User registered wrong URIs (.repl.co and ofoq.com) — needs to be fixed.

## signToken signature
```ts
signToken({ userId: string, role: string, email: string }): string
```
Use signToken from ../auth.js — never import jwt directly in route files.

**Why:** Caught a bug where barcode-login used jwt.sign directly — use signToken consistently.
