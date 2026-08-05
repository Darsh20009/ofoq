---
name: OAuth deployment routing
description: The deployed service and marketing site may use different origins for Google and Apple OAuth.
---

OAuth callback URLs must point to the live API/frontend origin that serves the callback route, not necessarily the public marketing `APP_URL`. Keep a separate `OAUTH_BASE_URL` and register its Google and Apple callback URLs exactly.

**Why:** The marketing domain can be hosted separately and return 404 for `/api/auth/*/callback`, even while the Render service and OAuth credentials are working.

**How to apply:** In production set `OAUTH_BASE_URL` to the deployed service origin, then register `/api/auth/google/callback` and `/api/auth/apple/callback` on that same origin in the provider consoles. Keep `APP_URL` for public links and email URLs.