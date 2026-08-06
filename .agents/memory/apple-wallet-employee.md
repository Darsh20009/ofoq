---
name: Employee Apple Wallet passes
description: Operational constraint for generating and delivering signed employee Wallet passes.
---

Employee Wallet pass signing succeeds when the Apple certificate, private key, and WWDR certificate secrets are present; validate the server-generated `.pkpass` before changing certificates or pass metadata.

**Why:** The pass generation path can be confused with browser download behavior, but signing and delivery are separate failure points.

**How to apply:** Test `generateWalletPass` server-side first, then debug iOS Safari/URL handling if the signed file still does not open in Wallet.