---
name: Platform owner control
description: Security boundary and external API limitation for the independent platform-owner console
---

Keep the platform-owner login independent from ordinary administrator accounts and from their application session cookie. A maintenance kill switch must be enforced server-side across page requests, application APIs, and WebSocket connections, with only the owner console remaining available to reverse it.

**Why:** The owner console is meant to control all staff accounts and take the public site offline, so its authority must not be inherited from a regular admin role or accidentally share that user's session lifecycle.

**How to apply:** Use a separate owner credential stored in Replit Secrets and a dedicated secure cookie session; limit staff control to explicitly allowed roles and record changes. Do not infer third-party management endpoints from a public health endpoint. If API documentation is unavailable, expose only a read-only health check until the owner provides a documented contract.
