---
name: i18n nav fix
description: Rules for keeping all 7 language overrides in ui.ts consistent — what breaks if you don't, and how to check.
---

## The Rule
All 5 non-Arabic/non-English language overrides in `client/src/i18n/ui.ts` MUST have `header.nav: [...]` (7 strings) explicitly set. Without it the nav falls back to English regardless of the selected language.

## hi / de / es vs ur / id
- `hi`, `de`, `es` spread `...en.home` and `...en.services` — so they inherit all new keys automatically.
- `ur` and `id` use **manual** home/services objects (no spread). Any new key added to `en.home` or `en.services` in the future must ALSO be added to both `ur` and `id` overrides manually.

**Why:** ur and id were written before the spread pattern was established, and their custom objects give translators full control — but that means they don't auto-pick up new English fallback keys.

**How to apply:** When you add a new key to `en.home` or `en.services`, search for `ur:` and `id:` in `ui.ts` and check if that block has the key explicitly. If not, add it with a localized value or a copy of the English default.
