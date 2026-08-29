---
name: Partner legacy records
description: How public partner data and older incomplete CMS records must coexist safely
---

Keep incomplete legacy partner records available to authenticated CMS users, but never expose them through the public partner feed until all bilingual display fields and a logo are present.

**Why:** The existing database can contain older partner documents created under a looser schema. Deleting or overwriting them would lose business data, while publishing them would create blank public dialogs.

**How to apply:** Any future partner migration should preserve legacy records as drafts, validate completeness at the public query boundary, and let staff complete them through the CMS.