---
name: GitHub push authentication
description: Environment-specific behavior encountered when pushing the OFOQ repository through the managed GitHub operation.
---

The managed GitHub push operation returned `UNAUTHENTICATED` even though the workspace exposed a `GITHUB_PERSONAL_ACCESS_TOKEN` secret name. The repository's local commits were created successfully and the worktree was clean except for intentionally untracked uploaded attachments.

**Why:** The push failure was an external authentication/session issue, not a repository or code validation failure.

**How to apply:** Before retrying a future push, verify that the Replit workspace GitHub account is connected or refresh the managed GitHub authorization; do not expose or print the token.