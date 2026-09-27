---
name: GitHub push authentication
description: Environment-specific behavior encountered when pushing the OFOQ repository through the managed GitHub operation.
---

GitHub pushes from this workspace have failed with `UNAUTHENTICATED` through the managed operation and with an invalid username/token error through `git push`. Reconnecting Git Providers did not immediately refresh the shell's `replit-git-askpass` authentication. Local commits remained ready and the remote branch unchanged. GitHub's Agent connector and Replit's Git provider connection are separate authorizations; connecting the former does not repair Git pushes.

**Why:** The push failures were external Git-provider authentication issues, not repository or code validation failures. Replit's Git pane documentation directs users to refresh the Git provider connection for this error.

**How to apply:** Ask the user to refresh GitHub under Replit Settings > Git Providers, then retry a non-force push once. If the shell still reports invalid credentials, have the user try Push in Replit's Git pane and check that the linked account has write access to the repository; do not keep retrying the unchanged shell credential. Do not ask for, expose, or print a token, and do not propose the separate GitHub connector as a fix for Git push authentication.