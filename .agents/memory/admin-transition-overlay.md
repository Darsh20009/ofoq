---
name: Admin transition overlay
description: Preventing the navigation loader from covering the authenticated admin dashboard
---

The navigation overlay timer must be started once per loader mount, not whenever the parent creates a new callback. Authentication and dashboard queries cause parent re-renders; restarting the timer can make the dark branded overlay appear to be a permanent white/blank dashboard.

**Why:** The dashboard rendered successfully while the transition layer continued covering it during post-login re-renders.

**How to apply:** Keep completion callbacks in a ref and use a mount-only timeout for page transition overlays. Separately, treat MongoDB 503 responses as an environment/database setup issue, not a React rendering failure.