---
name: Development asset proxy
description: Why public assets need explicit Vite proxy rules in the OFOQ two-workflow development setup.
---

In development, the React app is served by Vite on port 5000 while public assets live in the project-level `public` directory and are served by Express on port 3000. Root-level image and icon URLs therefore need explicit Vite proxy entries; otherwise Vite's SPA fallback can return `index.html` with HTTP 200 instead of the requested asset.

**Why:** A successful HTTP status alone can hide broken images when the response content type is HTML rather than the expected image or JavaScript file.

**How to apply:** When adding or troubleshooting root-level assets, verify both the URL's HTTP status and content type through port 5000, and keep proxy entries for `/images`, `/icons`, `/uploads`, `/manifest.json`, `/favicon.ico`, and `/sw.js`.