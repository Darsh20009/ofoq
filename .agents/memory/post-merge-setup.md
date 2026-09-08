---
name: Post-merge setup
description: Replit task merges require an explicitly configured, non-interactive post-merge setup script.
---

The post-merge hook is not implicit: the project must keep an idempotent setup script configured in Replit, otherwise merges fail with a missing-hook error.

**Why:** Task merges run dependency installation, build, and workflow reconciliation automatically; without a configured script the process stops before reconciliation.

**How to apply:** Keep the hook fast and non-interactive, install from the lockfile, run the project build, and validate it with the platform's post-merge runner after changes.