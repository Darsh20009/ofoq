---
name: GitHub push authentication
description: Environment-specific behavior encountered when pushing the OFOQ repository through the managed GitHub operation.
---

GitHub pushes from this workspace have failed with `UNAUTHENTICATED` through the managed operation and with an invalid username/token error through `git push`. Local commits were ready in both cases. GitHub's Agent connector and Replit's Git provider connection are separate authorizations; connecting the former does not repair Git pushes.

**Why:** The push failures were external Git-provider authentication issues, not repository or code validation failures. Replit's Git pane documentation directs users to refresh the Git provider connection for this error.

**How to apply:** Ask the user to disconnect and reconnect GitHub under Replit Workspace Settings > Git Providers, then retry a non-force push. Do not ask for, expose, or print a token, and do not propose the separate GitHub connector as a fix for Git push authentication.