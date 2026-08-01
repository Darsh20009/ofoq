---
name: OFOQ Client Portal
description: Architecture decisions and patterns for the client portal and service request system
---

# OFOQ Client Portal

## Architecture
- Auth: same JWT system as admin — `signToken` / `requireAuth` from server/auth.ts
- Client role: `role: "client"` in User model; guards: `RequireClientAuth` / `RequireClientGuest` in App.tsx
- State: same `useAuthStore` (zustand/persist) as admin — token in localStorage under "ofoq_token"
- All client API calls go through `client/src/api/clientApi.ts` which reads token from localStorage

## Service Request Lifecycle
- 5 stages: new → reviewing → approved → in_progress → completed
- Rejection is a terminal state: "rejected" (not in the linear flow)
- Status change by admin triggers email to client via `sendServiceRequestStageUpdate`
- New request triggers: admin email to Info@ofooq.com + client confirm email
- Model: `server/models/ServiceRequest.ts` — has notes[] (client+admin), statusHistory[], isInternal flag

## Email targets
- Admin notifications always go to: **Info@ofooq.com** (not info@ofoqhc.com)
- Client confirmation goes to: req.contactEmail (may differ from auth email)

**Why:** User explicitly stated Info@ofooq.com for all client-facing notifications.

## Routes pattern
- Client API: `/api/client/*` (registered in server/routes/index.ts)
- Admin service requests API: `/api/client/admin/*` (same router, requireAdmin middleware)
- Frontend client routes: `/client/*` under `<ClientLayout>` component
- Frontend admin routes: `/admin/service-requests`, `/admin/service-requests/:id`, `/admin/support`

## Support Chat
- SupportMessage model links clientId + optional requestId
- Admin replies via `/api/client/admin/support/:clientId`
- Client polls at 15s interval; admin polls at 10s
- Reply triggers email to client via `sendSupportReplyNotify`

## Key files
- `server/models/ServiceRequest.ts` — model + types + constants
- `server/models/SupportMessage.ts` — chat model
- `server/routes/client.routes.ts` — all service request + support API
- `client/src/api/clientApi.ts` — frontend API wrapper
- `client/src/layouts/ClientLayout.tsx` — client portal sidebar
