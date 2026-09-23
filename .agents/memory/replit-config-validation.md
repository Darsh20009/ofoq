---
name: Replit configuration validation
description: Editing imported Replit runtime configuration safely
---

Replit rejects direct edits to `.replit`. Write the revised TOML to a temporary file in the workspace and replace it using the `verifyAndReplaceDotReplit` callback.

**Why:** A direct patch was rejected even for removing a plain-text value; the validated replacement succeeded and prevented bypassing configuration schema checks.

**How to apply:** Use the validated replacement flow whenever changing `.replit`, preserving unrelated settings.