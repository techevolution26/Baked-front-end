# Cake Marketplace -- Frontend

Next.js App Router + TypeScript + Tailwind + react-konva.

This is a standalone repo -- the backend lives separately in
`cake-marketplace-backend`. Run that first (`docker compose up --build`
there), then point this app at it via `.env.local`.

## Setup
1. In the backend repo: `docker compose up --build`, then `python seed.py`
   to create a demo bakery at subdomain `sweetfig`
2. Here: `npm install`, `cp .env.local.example .env.local`
3. `.env.local` already has `DEV_TENANT_HOST=sweetfig.cakeplatform.test`
   pointing at that seeded bakery -- change it if you seed a different one
4. `npm run dev`

Visiting `http://localhost:3000` locally will show "no bakery found",
since your browser's real `Host` header is `localhost:3000`, not a real
bakery domain. `DEV_TENANT_HOST` overrides tenant resolution in
development only -- see `lib/tenant.ts`.

## Tenancy model: one domain per bakery
SaaS model, not a shared marketplace. Each bakery gets its own domain,
and a customer on that domain only ever sees that one bakery's catalog.

- `middleware.ts` captures the real, browser-supplied `Host` header and
  forwards it as a trusted `x-tenant-host` request header
- `lib/tenant.ts` resolves it to a `Bakery` via the backend's
  `/bakeries/resolve` endpoint (cached 5 min)
- `/design/[templateId]` and `/checkout/[blueprintId]` verify the
  resource actually belongs to the resolved tenant before rendering --
  otherwise a template/blueprint id could be viewed cross-tenant by
  guessing it
- Registration/login send the resolved tenant host as `X-Tenant-Host` so
  the backend scopes the account to the *correct* bakery, never a
  client-supplied one

## Role awareness
`app/layout.tsx` fetches the current user once and passes `isBakeryOwner`
down to `SiteHeader`, which only shows the "Bakery dashboard" link to
bakery_owner/admin accounts. `app/dashboard/layout.tsx` redirects anyone
else away from the whole `/dashboard` area server-side (not a client-side
hide -- a customer never even receives the dashboard HTML).

**This is a UX layer, not the security boundary** -- the backend
independently enforces the same rules (`require_role` on the mutating
endpoints, ownership checks on `GET /orders/{id}`), so even a direct API
call from a customer's session is rejected regardless of what the
frontend shows.

## Full site map -- everything is live, nothing left mocked

**Customer-facing**
| Route | Backed by |
|---|---|
| `/` | `GET /bakeries/resolve`, `GET /templates` |
| `/design/[templateId]` | `GET /templates/{id}`, `POST /blueprints` |
| `/checkout/[blueprintId]` | `GET /blueprints/{id}`, `POST /orders` |
| `/orders` | `GET /orders` (customer-scoped) |
| `/orders/[orderId]` | `GET /orders/{id}` |
| `/account` | `GET`/`PATCH /users/me` -- editable |

**Auth** -- `/login`, `/register` (username + password, httpOnly-cookie session)

**Bakery owner** (role-gated, see above)
| Route | Backed by |
|---|---|
| `/dashboard` | `GET /orders` (bakery-scoped), counted client-side |
| `/dashboard/orders` | `GET /orders` (bakery-scoped) |
| `/dashboard/orders/[orderId]` | `GET /orders/{id}`, `PATCH /orders/{id}/status` |
| `/dashboard/templates` | `GET /bakeries/me`, `GET /templates` |
| `/dashboard/templates/new` | `POST /templates` |
| `/dashboard/settings` | `GET`/`PATCH /bakeries/me` -- editable |

**Utility** -- custom `not-found` page

## Auth
Login/register go through Next.js Route Handlers (`app/api/auth/*`) that
call the FastAPI backend and set the JWT as an **httpOnly cookie** -- the
same BFF pattern as Tech Resolute's auth proxy. Client-side JS never
touches the raw token; every mutating action goes through a matching
`app/api/*` route that reads the cookie server-side and attaches the
`Authorization` header.

Registration is intentionally lightweight -- just username + password.
Name, phone, and email are added later via `/account`.

## Error handling
Every BFF route uses `lib/proxy.ts`'s `extractBackendError` to unwrap
FastAPI's `{"detail": "..."}` error format and forward the *actual*
message (e.g. "That username is already taken at this bakery") instead
of a generic string -- this was a real gap caught during a code-review
pass, not just style: a few earlier forms were silently swallowing
specific, actionable error messages behind "Something went wrong".
`/auth/login` deliberately stays generic on purpose (not revealing
whether a username exists is standard security practice, not an
oversight).

## Structure
- `middleware.ts` -- captures the real Host header for tenant resolution
- `lib/tenant.ts` -- resolves the current request's bakery from that header
- `lib/proxy.ts` -- shared error-unwrapping helper for BFF routes
- `app/page.tsx` -- the storefront (one bakery, resolved from domain)
- `app/design/[templateId]/`, `app/checkout/[blueprintId]/`, `app/orders/` -- customer flow
- `app/account/` -- editable profile
- `app/dashboard/` -- bakery owner area, role-gated, nested layout with sidebar nav
- `app/api/` -- BFF route handlers (auth, users, bakeries, blueprints, orders, templates, dashboard order status)
- `components/CakeLayerEditor.tsx` -- tap/drag cake builder canvas
- `components/OrderStatusStepper.tsx` -- icon-based order tracker (customer view)
- `components/DashboardOrderActions.tsx` -- accept/reject/status buttons (bakery owner view)
- `components/AccountForm.tsx`, `components/BakerySettingsForm.tsx` -- editable settings forms
- `lib/api.ts` -- server-side fetchers against the FastAPI backend
- `lib/session.ts` -- reads the httpOnly session cookie
- `types/api.ts` -- shared types matching the backend schemas

## Known gaps (matching the backend's, by design)
- No M-Pesa payment at checkout yet (order is created with a real
  calculated price, just not paid)
- No bakery self-service signup (only `seed.py` creates tenants right now)
