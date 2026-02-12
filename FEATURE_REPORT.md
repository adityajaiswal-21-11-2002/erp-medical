# Feature Completion Report — 4-Role ERP Medical

## Phase 0 — Inventory

### A) Frontend routes (Next.js App Router)

| Segment | Routes |
|--------|--------|
| **Auth** | `/auth/login`, `/auth/login/loading` |
| **Admin** | `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/kyc`, `/admin/products`, `/admin/orders`, `/admin/feature-flags`, `/admin/erp-sync`, `/admin/loyalty`, `/admin/payments`, `/admin/integrations`, `/admin/shipping-logs`, `/admin/analytics`, `/admin/compliance`, `/admin/banners`, `/admin/tickets`, `/admin/reports` |
| **Retailer** | `/retailer`, `/retailer/dashboard`, `/retailer/kyc`, `/retailer/catalog`, `/retailer/catalog/[sku]`, `/retailer/cart`, `/retailer/checkout`, `/retailer/orders`, `/retailer/orders/[id]`, `/retailer/returns`, `/retailer/schemes`, `/retailer/loyalty`, `/retailer/payments`, `/retailer/affiliate`, `/retailer/support`, `/retailer/profile` |
| **Distributor** | `/distributor`, `/distributor/dashboard`, `/distributor/orders`, `/distributor/orders/[id]`, `/distributor/inventory`, `/distributor/invoices`, `/distributor/settlements`, `/distributor/analytics`, `/distributor/returns`, `/distributor/retailers`, `/distributor/support`, `/distributor/profile` |
| **Customer** | `/customer`, `/customer/account`, `/customer/cart`, `/customer/catalog`, `/customer/checkout`, `/customer/orders`, `/customer/orders/[id]`, `/customer/product/[sku]`, `/customer/support` |

### Navigation → route mapping

- **Admin sidebar:** Dashboard, Users, KYC, Products, Orders, Feature Flags, ERP Sync, Loyalty & Schemes, Payments, Integrations, Shipping Logs, Analytics, Compliance Logs, Banners, Tickets, Reports → all map to `/admin/*` above.
- **Retailer sidebar:** Dashboard, Complete KYC, Catalog, Cart, Orders, Returns, Schemes & Coupons, Loyalty, Payments, Affiliate, Support, Profile → `/retailer/*`.
- **Distributor sidebar:** Dashboard, Orders, Inventory, Invoices, Settlements, Analytics, Returns, Retailers, Support, Profile → `/distributor/*`.
- **Customer:** Header links to Cart, Account; no sidebar (storefront).

### Shared components

- **Layout/guard:** `AuthGate`, `PageHeader`, `DataTable`, `StatusBadge`, `ModalConfirm`, `DrawerPanel`, `Timeline`.
- **Domain:** `KycWizard`, `SupportTickets`, `ErpSyncConsole`, `LoyaltyRewards`, `ProductCatalog`, `OrdersManagement`, `PaymentsReconciliation`, `RetailersKyc`.
- **UI:** shadcn/ui (Button, Card, Table, Dialog, Select, Input, Tabs, etc.).

### B) Backend API routes (server + app/api proxy)

| Mount | Endpoints |
|-------|-----------|
| **auth** | POST /register, /login, /logout; GET /me |
| **users** | GET /, POST /, PATCH /:id, PATCH /:id/password, DELETE /:id |
| **account** | GET /profile, PATCH /consent |
| **kyc** | POST /submit, GET /status, GET /submissions (ADMIN), PATCH /submissions/:id (ADMIN) |
| **products** | GET /, GET /:id, POST / (ADMIN), PATCH /:id (ADMIN), DELETE /:id (ADMIN), POST /:id/photo (ADMIN) |
| **orders** | GET /, GET /:id, POST /, PATCH /:id/status (ADMIN/DISTRIBUTOR), PATCH /:id/invoice (ADMIN) |
| **payments** | POST /intent, POST /webhook, GET / (ADMIN); POST /razorpay/order, POST /razorpay/verify, GET /razorpay (ADMIN), GET /webhook-events (ADMIN) |
| **shipments** | GET /logs (ADMIN), GET /integrations/shiprocket|rapidshyp/test (ADMIN), POST /:orderId/create (ADMIN/DISTRIBUTOR), POST /:orderId/track, GET /:orderId |
| **webhooks** | POST /shiprocket, /rapidshyp, /razorpay |
| **erp** | POST /sync/products, /sync/inventory, /orders, /invoice-callback, /shipment-status (ADMIN); GET /invoices (ADMIN/DISTRIBUTOR) |
| **sync** | GET /logs, POST /retry/:id |
| **loyalty** | GET /summary, POST /earn, POST /redeem |
| **rewards** | GET /, POST / (ADMIN), POST /:id/redeem, POST /scratch, POST /wish |
| **referrals** | GET /me, POST /track, POST /attribute |
| **analytics** | POST /events, GET /summary (ADMIN) |
| **feature-flags** | GET /, PATCH /:key (ADMIN) |
| **returns** | GET /, POST /, PATCH /:id (requires RETURNS_ENABLED) |
| **coupons** | GET /, POST / (ADMIN) (requires COUPONS_ENABLED) |
| **tickets** | GET /, POST /, PATCH /:id |
| **banners** | GET /, POST / (ADMIN), PATCH /:id (ADMIN) |
| **compliance** | GET / |
| **distributor** | GET /orders, PATCH /orders/:id, GET /inventory, GET /settlements |

### Models (server)

- User, AccountProfile, Product, Order, OrderWorkflow, KycSubmission, FeatureFlag, LoyaltyLedger, RewardCatalog, Referral, ReferralAttribution, PaymentIntent, Payment, ReturnRequest, Ticket, BannerAsset, ComplianceLog, AnalyticsEvent, Coupon, Shipment, ShippingLog, WebhookEvent, SyncLog.

---

## Phase 1 — Flow spec (canonical flows per role)

**Admin:** Manage users + accountType (4 roles); approve/reject retailer KYC; toggle feature flags (returns/coupons); run ERP sync + see logs/retry; view/update orders + invoice; view payments + webhook events; view shipping logs + shipment status; manage loyalty/reward catalog + ledgers; view affiliate attribution; view analytics; manage banners; manage tickets; view compliance logs.

**Retailer:** Submit KYC + see status; browse catalog, cart, checkout, place order; see order status + timeline; use coupons/returns only when flags ON; see loyalty + scratch/redeem; generate referral link + see affiliate stats; create ticket + see replies.

**Distributor:** See order queue; approve/reject, allocate, pack, ship; create shipment + track; view inventory/invoices/settlements (stubs OK); handle tickets.

**Customer:** Browse storefront, order; track orders + shipment; referral ?ref= capture + attribution.

---

## Feature table (Status: PASS / FAIL / PARTIAL)

| Feature | Required | Backend Endpoint(s) | Frontend Route(s) | Nav? | Roles | Status | Notes |
|---------|----------|---------------------|-------------------|------|-------|--------|-------|
| Auth login/logout | Y | POST /api/auth/login, logout, GET /me | /auth/login | Y | All | PASS | |
| Account + role mapping | Y | GET/PATCH /api/users, accountType in body | /admin/users | Y | Admin | PASS | Create/update user with accountType |
| KYC submit + status | Y | POST /api/kyc/submit, GET /api/kyc/status | /retailer/kyc | Y | Retailer | PASS | |
| KYC admin approve/reject | Y | GET /api/kyc/submissions, PATCH /api/kyc/submissions/:id | /admin/kyc | Y | Admin | PASS | |
| Feature flags toggle | Y | GET /api/feature-flags, PATCH /:key | /admin/feature-flags | Y | Admin | PASS | |
| Feature flag enforcement (returns/coupons) | Y | requireFeatureFlag on returns + coupons routes | N/A | N/A | Backend | PASS | 403 when flag OFF |
| ERP sync + logs | Y | POST /api/erp/sync/*, GET /api/sync/logs, POST retry | /admin/erp-sync | Y | Admin | PASS | UI calls GET /api/sync/logs; retry wired |
| Orders list + detail + status | Y | GET/POST /api/orders, PATCH status | /admin/orders, /retailer/orders, /distributor/orders | Y | All | PASS | |
| Order invoice (admin) | Y | PATCH /api/orders/:id/invoice | /admin/orders | Y | Admin | PASS | Set Invoice action + dialog in admin orders |
| Payments list + Razorpay | Y | GET /api/payments, /api/payments/razorpay, webhook-events | /admin/payments | Y | Admin | PASS | |
| Shipping logs + create/track | Y | GET /api/shipments/logs, POST create/track, GET :orderId | /admin/shipping-logs, distributor order detail | Y | Admin, Distributor | PASS | |
| Loyalty summary + earn/redeem | Y | GET /api/loyalty/summary, POST earn, redeem | /retailer/loyalty, /admin/loyalty | Y | Retailer, Admin | PASS | |
| Reward catalog + scratch | Y | GET/POST /api/rewards, POST /scratch, /:id/redeem | /admin/loyalty, /retailer/loyalty | Y | Admin, Retailer | PASS | Scratch + redeem + wish wired in retailer loyalty |
| Affiliate referral link + stats | Y | GET /api/referrals/me, POST track, attribute | /retailer/affiliate | Y | Retailer | PASS | |
| Analytics dashboard | Y | GET /api/analytics/summary, POST /events | /admin/analytics | Y | Admin | PASS | |
| Banners manage | Y | GET/POST/PATCH /api/banners | /admin/banners | Y | Admin | PASS | |
| Support tickets | Y | GET/POST/PATCH /api/tickets | /admin/tickets, /retailer/support, /distributor/support | Y | All | PASS | |
| Compliance logs | Y | GET /api/compliance | /admin/compliance | Y | Admin | PASS | |
| Catalog + cart + checkout (retailer) | Y | GET /api/products, POST /api/orders | /retailer/catalog, cart, checkout | Y | Retailer | PASS | |
| Coupons (when flag ON) | Y | GET/POST /api/coupons | /retailer/schemes | Y | Retailer | PASS | UI shows "Coupons disabled by admin" on 403 |
| Returns (when flag ON) | Y | GET/POST/PATCH /api/returns | /retailer/returns, /distributor/returns | Y | Retailer, Distributor | PASS | UI shows "Returns disabled by admin" on 403 |
| Distributor order queue + approve/ship | Y | GET /api/distributor/orders, PATCH /orders/:id | /distributor/orders, orders/[id] | Y | Distributor | PASS | |
| Distributor inventory/invoices/settlements | Y | GET /api/distributor/inventory, /invoices, /settlements | /distributor/inventory, invoices, settlements | Y | Distributor | PASS | Stubs; empty state "No invoices/settlements/data" |
| Customer storefront + order | Y | GET /api/products, POST /api/orders | /customer/catalog, checkout, orders | Y | Customer | PASS | |
| Customer referral ?ref= | Y | POST /api/referrals/track | Customer layout captures ref | Y | Customer | PASS | |
| Integrations (Shiprocket/Razorpay test) | Y | GET /api/shipments/integrations/*/test | /admin/integrations | Y | Admin | PASS | |
| Reports (admin) | Y | GET /api/orders (data for export) | /admin/reports | Y | Admin | PASS | Orders CSV export |
| AuthGuard / AccessDenied | Y | N/A | AuthGate shows AccessDenied | Y | All | PASS | No blank screens |

---

## Phase 2 — Gap detection

- **audit:smoke:** `npm run audit:smoke` runs `scripts/audit-smoke.mjs`. Requires API running (e.g. `npm run dev`). Uses `AUDIT_API_URL` (default `http://localhost:3000`). Logs in as admin@demo.com, then hits: /api/health, /api/users, /api/orders, /api/products, /api/feature-flags, /api/kyc/submissions, /api/sync/logs, /api/compliance, /api/tickets, /api/banners, /api/analytics/summary, /api/distributor/orders, /api/shipments/logs. Exits 1 if any fail.
- **Static checks:** Nav items map to existing routes; AuthGate shows AccessDenied (no blank); returns/coupons pages show disabled message on 403.

## Phase 3 — Gaps addressed

- All previous PARTIALs verified and set to PASS (ERP sync logs, order invoice, rewards scratch/redeem, coupons/returns 403 handling, distributor empty states).

## Phase 4 — Automated tests

- **Backend (Jest + Supertest):** `npm run test:backend` in backend folder: auth access, KYC, feature flags, ERP sync, analytics, referrals, payments, shipments, api.smoke.
- **E2E (Playwright):** `npm run test:e2e`. flows.spec: Admin (flags, ERP sync, banners, analytics); Retailer (KYC, catalog, checkout, loyalty); Distributor (orders, accept, mark shipped); Customer (referral link, checkout, attribution). integrations.spec: Admin integrations/shipping-logs/payments; distributor shipment; customer checkout. admin-pages.spec: every admin menu page loads without blank screen.
- **Run E2E with Next.js API only:** Set `E2E_API_URL=http://localhost:3000` and run Next.js with `npm run dev` (no backend on 5000).

## Phase 5 — Final

- Feature table above: all PASS.
- Commands and stubs below.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js only (uses server via app/api) |
| `npm run dev:all` | Frontend + backend (concurrently) |
| `npm run seed` | Seed demo data (runs backend seed; use same MONGODB_URI) |
| `npm run test:backend` | Backend Jest (backend folder) |
| `npm run test:e2e` | Playwright E2E |
| `npm run test:all` | test:backend + test:e2e |
| `npm run audit:smoke` | Hit key API endpoints; requires dev server (default localhost:3000) |

**Seed:** Run `npm run seed` (or `npm run backend:seed`). Creates admin@demo.com, user@demo.com (retailer), distributor@demo.com, customer@demo.com + products + feature flags. Ensure MONGODB_URI is set (e.g. in root .env). For Next.js-only dev, same DB is used by server/ when you run `npm run dev`.

**Remaining stubs/limitations:** ERP gateway (sync may stub external system); shipping providers (Shiprocket/RapidShyp require env keys for live create/track); Razorpay webhook needs RAZORPAY_WEBHOOK_SECRET for production verification; distributor inventory/invoices/settlements are stub data (no real invoicing engine).

---

## Exact routes and endpoints (reference)

| Area | Method | Path | Role |
|------|--------|------|------|
| Health | GET | /api/health | Public |
| Auth | POST | /api/auth/login, /api/auth/logout | Public / Auth |
| Users | GET, POST, PATCH | /api/users, /api/users/:id | Admin |
| KYC | POST, GET | /api/kyc/submit, /api/kyc/status | Retailer |
| KYC Admin | GET, PATCH | /api/kyc/submissions, /api/kyc/submissions/:id | Admin |
| Feature flags | GET, PATCH | /api/feature-flags, /api/feature-flags/:key | Admin |
| Sync logs | GET, POST | /api/sync/logs, /api/sync/retry/:id | Admin |
| Orders | GET, POST, PATCH | /api/orders, /api/orders/:id, /api/orders/:id/status, /api/orders/:id/invoice | Auth / Admin / Distributor |
| Payments | GET, POST | /api/payments, /api/payments/razorpay/*, /api/payments/webhook-events | Admin |
| Shipments | GET, POST | /api/shipments/logs, /api/shipments/:orderId/create, /api/shipments/:orderId/track | Admin, Distributor |
| Loyalty | GET, POST | /api/loyalty/summary, /api/rewards, /api/rewards/scratch, /api/rewards/:id/redeem | Auth |
| Referrals | GET, POST | /api/referrals/me, /api/referrals/track, /api/referrals/attribute | Auth |
| Analytics | GET, POST | /api/analytics/summary, /api/analytics/events | Admin / Auth |
| Tickets | GET, POST, PATCH | /api/tickets, /api/tickets/:id | Auth |
| Banners | GET, POST, PATCH | /api/banners, /api/banners/:id | Admin |
| Compliance | GET | /api/compliance | Admin |
| Distributor | GET, PATCH | /api/distributor/orders, /api/distributor/orders/:id, /api/distributor/inventory, /api/distributor/settlements | Distributor |
| Returns | GET, POST, PATCH | /api/returns (requires RETURNS_ENABLED) | Retailer, Distributor |
| Coupons | GET, POST | /api/coupons (requires COUPONS_ENABLED) | Retailer, Admin |
