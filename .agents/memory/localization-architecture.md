---
name: Localization architecture
description: Durable guidance for maintaining OFOQ language support across public and authenticated surfaces
---

Use the shared UI translation layer for user-facing copy rather than adding language conditionals inside individual pages. The selected language also controls document direction: Arabic and Urdu are RTL; the other supported languages are LTR.

**Why:** Repeated inline language logic caused inconsistent wording and left authenticated pages with stale Arabic labels while the public site was translated.

**How to apply:** Add new shared copy to the UI copy structure, use the language context in layouts and pages, and keep service/catalog data on an explicit English fallback when a complete translation is unavailable. For admin screens, preserve functional labels and translate them incrementally without changing authentication behavior. Keep page-specific admin overrides under `adminPages`, while authentication copy belongs at the root `adminLogin` section so all auth surfaces resolve it consistently.