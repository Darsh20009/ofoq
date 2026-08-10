---
name: Admin CMS site content
description: How the admin CMS site content editor works end-to-end — route, storage, frontend merge.
---

## Architecture
- **Storage**: `SystemSettings` MongoDB doc with `key: "siteContent"`, `value: { ar: {...}, en: {...}, ... }` (one JSON blob per language).
- **Backend**: `GET /api/cms/site-content` (public) returns full content blob. `PUT /api/cms/site-content` (admin only) accepts `{ lang, data }` and upserts that language's blob.
- **Frontend merge**: `LangContext.tsx` fetches `/api/cms/site-content` once on mount, stores in `siteContent` state. `ui` memo runs `deepMerge(getUiCopy(lang), siteContent[lang])` — DB values win over static defaults.
- **Admin page**: `client/src/pages/admin/cms/SiteContentPage.tsx` at route `/admin/cms/site-content`. Tabbed by language (7 tabs) × section sidebar (Home, About, Services, Contact, Header). Each field shows the built-in default as placeholder and saves only what the admin overrides.

## Important: PUT saves the entire language blob
When the admin saves, the entire `content[activeLang]` object is sent (not field-by-field). This means loading existing content on mount, editing in memory, and saving the whole language at once.

**Why:** Simplicity — no need for per-field path resolution on the backend. The downside is a slightly larger payload, acceptable for CMS content.

**How to apply:** If you add new editable fields to `SiteContentPage.tsx`, you only need to add entries to the `SECTIONS` array — no backend changes needed.
