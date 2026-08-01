---
name: OFOQ Frontend Setup
description: React/Vite frontend conventions, port, proxy, and key component notes
---

## Dev server
- Port 3000, proxies `/api` to port 5000 (Express backend)
- `server.allowedHosts: true` for Replit iframe proxy

## Language/i18n
- Default: Arabic (`"ar"`) via `LangContext` + `localStorage["ofoq_lang"]`
- Admin panel forces Arabic on mount via `useEffect` in `AdminLayout` (guards against leaked "en" from localStorage)
- Translations in `client/src/i18n/translations.ts`

## Key icons/assets
- `public/icons/favicon.svg` — transparent background, white OFOQ mark + red F
- `public/favicon.ico` — 32×32 transparent PNG (not a real ICO multi-res)
- `public/icons/og-image.png` — 1200×630 branded card for WhatsApp/social sharing
- All icons regenerated via sharp+SVG in Node.js (not committed as source — see `/tmp/gen-icons.mjs` pattern)
- `public/icons/logo-source.svg` + `public/icons/logo.png` — 512×512 with navy rounded background

## Notification permission
`NotificationPermissionModal` component imported in `AdminLayout` — shows 2s after first admin login (checks `localStorage["ofoq_notif_asked"]`), requests `Notification.requestPermission()` and subscribes to `/api/push/subscribe`.

## QR scanning
`jsQR` library added as universal fallback for Safari/Firefox/iOS where `BarcodeDetector` is unavailable. Scan loop polls every 150ms via `requestAnimationFrame`.
