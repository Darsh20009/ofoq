---
name: GitHub sync validation
description: Durable validation rule for merging newer public-site changes from GitHub.
---

When synchronizing OFOQ from GitHub, validate the public contact and social endpoints after the merge instead of assuming the remote branch preserves the latest brand requirements.

**Why:** Newer remote UI commits have previously reintroduced older social-platform links and telephone hrefs while still building successfully.

**How to apply:** After a GitHub merge, search the public layout and contact page for deprecated endpoints, restore the current WhatsApp/social destinations if needed, then run the client build.