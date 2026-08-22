---
name: Mockup sandbox dependency resolution
description: How to restore a nested mockup preview when declared Vite plugins are not installed locally.
---

Nested mockup previews may declare their own Vite plugins while the runtime resolves packages from the workspace root.

**Why:** A sandbox can fail to start with successive `ERR_MODULE_NOT_FOUND` errors even though its package manifest declares the missing plugins, because its local dependency installation is absent.

**How to apply:** Install the missing declared package through the approved package workflow at the workspace level, then restart only the affected preview workflow and read its log for the next missing dependency.