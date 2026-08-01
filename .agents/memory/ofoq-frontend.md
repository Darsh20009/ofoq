---
name: OFOQ Frontend Setup
description: React frontend architecture, dev workflow, and key design decisions for OFOQ
---

## Stack
- React 18 + TypeScript + Vite 5
- Tailwind CSS 3 with custom OFOQ theme (navy #2B273F, green #33B27C, yellow #E5FE04)
- React Router v6, Zustand (auth state), TanStack Query, react-hook-form, Recharts, Framer Motion
- Font: Cairo (Google Fonts) as primary Arabic font (GE_SS_Two fallback)

## Workflow
- Dev: `npm run dev:client` (Vite on port 3000, proxies /api + /ws to port 5000)
- Build: `npm run build:client` → outputs to `public/dist/`
- Both workflows must run simultaneously: OFOQ Backend (port 5000) + OFOQ Frontend (port 3000)

## Key Files
- `client/src/App.tsx` — routing (public + /admin routes)
- `client/src/layouts/AdminLayout.tsx` — collapsible sidebar, notifications, user menu
- `client/src/layouts/PublicLayout.tsx` — navbar + footer + back-to-top
- `client/src/api/client.ts` — axios client with token interceptor + 401 redirect
- `client/src/store/authStore.ts` — Zustand auth store (persisted in localStorage key `ofoq-auth`)
- `client/src/styles/globals.css` — all Tailwind layers + custom components

## Design System (Tailwind classes)
- `.btn-primary` (green), `.btn-secondary` (navy), `.btn-yellow`, `.btn-outline`, `.btn-ghost`, `.btn-danger`
- `.card`, `.card-hover`, `.input-field`, `.label`, `.badge-*`, `.stat-card`
- `.sidebar-link`, `.sidebar-link.active`, `.table`, `.page-header`, `.section-title`

## Auth Flow
- JWT stored in localStorage key `ofoq_token`
- Zustand store persisted under `ofoq-auth`
- 401 response → clears token → redirects to `/admin/login`
- Supports 2FA step (tempToken flow)

## SEO / AEO Setup (ofoqhc.com)
- Domain: https://ofoqhc.com (APP_URL updated to this)
- `client/index.html` — mega meta tags: ~200 Arabic+English keywords, Organization/WebSite/LocalBusiness/FAQPage/SoftwareApplication/BreadcrumbList JSON-LD, OG, Twitter Card, canonical, hreflang, speakable AEO schema
- Per-page Helmet with canonical, OG, JSON-LD on: HomePage, ServicesPage, AboutPage, BlogPage, ContactPage
- `public/robots.txt` — AI crawlers (GPTBot, ClaudeBot, PerplexityBot) explicitly allowed; /admin/ and /api/ blocked
- `public/sitemap.xml` — all 5 public pages with xhtml:link hreflang + image sitemap
- Static file fix in `server/app.ts`: `public/` now served at root path (not just /public/ prefix) so robots.txt and sitemap.xml serve at canonical URLs
- Qirox Studio attribution bar added below main footer in PublicLayout.tsx: black bg, "صُنع بواسطة Qirox Studio Group" links to https://qiroxstudio.online

## Important Decisions
**Why:** Vite dev server on port 3000 (not 5000) — avoids conflict with Express backend. Proxy in vite.config.ts handles /api/* and /ws routing transparently.
**Why:** Cairo font from Google Fonts instead of GE_SS_Two (commercial) — production system should load GE_SS_Two via @font-face if font files are available.
**Why:** Build outputs to `public/dist/` so Express static middleware can serve it in production from the same origin.
**Why:** `@types/express` pinned to `^4.17.21` (not v5) — v5 types change ParamsDictionary to `string | string[]` which breaks 14 routes.
