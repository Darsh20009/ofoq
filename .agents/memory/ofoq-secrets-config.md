---
name: OFOQ Secrets & Env Config
description: Which secrets/env vars are set, what remains, and where each value came from
---

# OFOQ Secrets & Environment Configuration

## Status (last confirmed working)
- MongoDB: connected (`✅ MongoDB connected successfully` in backend logs)
- Google OAuth: `google: true` from `/api/auth/status`
- Apple OAuth: `apple: true` from `/api/auth/status`
- VAPID: auto-generated (ephemeral); set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY as secrets for persistent push notifications

## Secrets set (Replit Secrets)
- `MONGODB_URI` — Atlas cluster (ofoq.qfouece.mongodb.net or qiroxsystem.ekvjdkj)
- `JWT_SECRET` — set from env file
- `SESSION_SECRET` — set from env file
- `GOOGLE_CLIENT_SECRET` — GOCSPX-... (Google Cloud Console)
- `CPANEL_SMTP_PASS` — cPanel mail password
- `APPLE_PRIVATE_KEY` — P-256 EC key for Apple Sign In
- `APPLE_PASS_CERT` — pass.com.qirox.employee cert PEM
- `APPLE_PASS_KEY` — pass key PEM
- `APPLE_WALLET_KEY_B64` — base64-encoded wallet key
- `APPLE_WWDR_CERT` — Apple WWDR G4 cert PEM
- `GITHUB_PERSONAL_ACCESS_TOKEN` — used for git push via remote URL injection

## Non-secret env vars set (shared)
- APP_NAME, APP_NAME_AR, APP_URL, EMPLOYEE_URL, EMAIL_SENDER_NAME
- JWT_EXPIRES_IN=7d
- CPANEL_SMTP_HOST=server222.web-hosting.com, CPANEL_SMTP_PORT=465, CPANEL_SMTP_USER=info@qirox.online
- GOOGLE_CLIENT_ID=722115647290-f6dl35qs3611p4ohi24ljuku26ndnf9l.apps.googleusercontent.com
- APPLE_TEAM_ID=V4K6RM59LS, APPLE_CLIENT_ID=com.ofoqhc, APPLE_KEY_ID=536AY95XA7
- APPLE_WALLET_PASS_ID=pass.com.qirox.employee, APPLE_WALLET_TEAM_ID=V4K6RM59LS

## GitHub push method
**Why:** Replit managed gitPush() returns UNAUTHENTICATED even with PAT secret present.
**How to apply:** Temporarily inject token into remote URL:
`git remote set-url origin "https://Darsh20009:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/Darsh20009/ofoq.git"`
then push, then reset URL back to plain https.
