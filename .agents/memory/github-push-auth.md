---
name: GitHub push authentication
description: Environment-specific behavior encountered when pushing the OFOQ repository through the managed GitHub operation.
---

GitHub pushes from this workspace have failed with `UNAUTHENTICATED` through the managed operation and with an invalid username/token error through `git push`. Reconnecting Git Providers did not immediately refresh the shell's `replit-git-askpass` authentication. A user-provided GitHub secret passed through a one-off Git credential helper succeeded without placing the token in the remote URL or logs. GitHub's Agent connector and Replit's Git provider connection are separate authorizations.

**Why:** The push failures were external Git-provider authentication issues, not repository or code validation failures. Replit's Git pane documentation directs users to refresh the Git provider connection for this error.

**How to apply:** Prefer refreshing Git Providers and retrying a non-force push once. If shell authentication remains stale and the user has supplied a PAT through Replit Secrets, use it only inside an ephemeral Git credential helper; never put it in a remote URL, print it, or persist it in a config file. Verify the remote SHA after pushing. Do not propose the separate GitHub connector as a fix for Git push authentication.