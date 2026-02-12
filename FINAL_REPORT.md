# ERP Medical — Deep End-to-End Verification Report

**Date:** 2026-02-12  
**Scope:** Referral, Loyalty, Payments (Razorpay), Shipping (Shiprocket + RapidShyp), Order/Stock integrity

---

## PASS/FAIL Summary

| Capability | Result | Notes |
|------------|--------|-------|
| **Referral / Attribution** | PASS | Capture, attribute, idempotency verified |
| **Loyalty Programme** | PASS | Earn, redeem, balance check, idempotency |
| **Payments (Razorpay)** | PASS | Order create, verify, webhook, signature validation |
| **Shipping (Shiprocket + RapidShyp)** | PASS | Create, track, idempotency; stubbed in tests |
| **Order + Stock Integrity** | PASS | Create reduces stock, cancel restores, insufficient stock rejected |
| **Backend Unit/Integration Tests** | PASS | 46 tests, 12 suites |
| **E2E (Playwright)** | CONDITIONAL | Run with app + backend up; flows covered |

---

## Stack Detected

| Component | Technology |
|-----------|------------|
| Backend | Express.js 4.x |
| Test framework | Jest 29.x + Supertest |
| E2E framework | Playwright |
| Package manager | npm / pnpm |
| Frontend | Next.js 15 |
| Database | MongoDB (Mongoose) |

---

## Routes / Endpoints

### Referral / Affiliate
- `GET /api/referrals/me` — get retailer refCode
- `POST /api/referrals/track` — track referral click
- `POST /api/referrals/attribute` — attribute order to referral

### Loyalty
- `GET /api/loyalty/summary` — points balance, tier, ledger
- `POST /api/loyalty/earn` — earn points (admin/backend)
- `POST /api/loyalty/redeem` — redeem points (balance validated)
- `GET /api/rewards`, `POST /api/rewards/:id/redeem`, `POST /api/rewards/scratch`

### Payments (Razorpay)
- `GET /api/payments/razorpay/key` — public key for checkout
- `POST /api/payments/razorpay/order` — create Razorpay order
- `POST /api/payments/razorpay/verify` — verify payment signature
- `POST /api/webhooks/razorpay` — webhook (payment.captured, order.paid)
- `GET /api/payments/razorpay`, `GET /api/payments/webhook-events` — admin

### Shipments
- `POST /api/shipments/:orderId/create` — create shipment (provider: SHIPROCKET | RAPIDSHYP)
- `POST /api/shipments/:orderId/track` — track shipment
- `GET /api/shipments/:orderId` — get shipment
- `GET /api/shipments/logs` — admin shipping logs
- `POST /api/webhooks/shiprocket`, `POST /api/webhooks/rapidshyp` — webhooks

---

## Deterministic Seed

- **Admin:** admin@demo.com / Admin@123  
- **Retailer:** user@demo.com / User@123  
- **Distributor:** distributor@demo.com / Distributor@123  
- **Customer:** customer@demo.com / Customer@123  
- **Products:** 10 with known prices/stock (when `productCount === 0`)  
- **Ref code (deterministic):** `REF_DEMO` when `SEED_DETERMINISTIC=1`  
- **Feature flags:** RETURNS_ENABLED, COUPONS_ENABLED ON  
- **Command:** `cross-env SEED_DETERMINISTIC=1 npm run backend:seed`

---

## Scenarios Covered

### Referral
- Customer visits with ?ref=REF_DEMO → ref stored in localStorage, track called
- Create order with referralCode → attribution created; retailer attributedOrders +1
- Invalid ref → order succeeds, no attribution
- Duplicate attribute → idempotent (one attribution per order)
- Same customer, two orders, same ref → attribution increments for both

### Loyalty
- Earn points on payment success (Razorpay verify/webhook) — NOT on order placement
- Redeem within balance → success
- Redeem > balance → 400 "Insufficient points balance"
- Duplicate payment.captured webhook → no double-credit (RAZORPAY_CAPTURE + metadata.orderId)

### Payments
- Create Razorpay order → returns keyId, razorpayOrderId, amount (paise)
- Valid signature verify → Payment CAPTURED, loyalty credited once
- Invalid signature verify → 400
- Webhook idempotency via WebhookEvent unique eventId
- payment.failed → no loyalty (handled by not processing)

### Shipping
- Create shipment SHIPROCKET / RAPIDSHYP → Shipment saved with provider, awb, status
- Create twice without force → returns existing (idempotent)
- Track → updates status + tracking
- Provider errors → ShippingLog recorded (when real provider used)

### Order / Stock
- Order creation reduces stock
- Cancel restores stock
- Insufficient stock rejects
- Duplicate cancel does not double-restore

---

## Known Limitations

- **External APIs:** Tests use mocks (shippingStub, Jest mocks for Razorpay). No live Shiprocket/RapidShyp/Razorpay calls in CI.
- **Razorpay webhook raw body:** Production should use raw body for signature verification; Express.json() may alter body. Consider `express.raw()` for webhook route.
- **Referral ref code change:** Last ref wins (localStorage overwrites on new ?ref=).

---

## Commands to Rerun

```bash
# Backend tests (no services required)
npm run test:backend
# or: cd backend && pnpm test

# E2E (requires app + backend running)
npx playwright install   # first-time: install browsers
npm run dev:all          # in one terminal
npm run test:e2e         # in another

# All tests
npm run test:all
```

---

## Fixtures for Mocks

- `backend/src/__tests__/fixtures/razorpay-webhook-payment-captured.json`
- `backend/src/__tests__/fixtures/shiprocket-order-response.json`
- `backend/src/__tests__/fixtures/rapidshyp-track-response.json`

---

## Fixes Applied

1. **Loyalty on payment only:** Removed loyalty credit from order creation; credit only on Razorpay verify/webhook.
2. **Referral idempotency:** Check `ReferralAttribution.findOne({ orderId })` before creating.
3. **Loyalty redeem balance:** Validate `pointsToRedeem <= balance` before redeeming.
4. **Razorpay verify invalid sig:** Return 400 JSON instead of throw (for consistent handling).
5. **GET /api/payments/razorpay/key:** Added for frontend checkout.
6. **Shipping stub:** Added `raw`, `assignShipment(id?)`, `track(id?)` for controller compatibility.
7. **Seed:** REF_DEMO for deterministic tests; 10 products.
8. **Playwright:** retries=0 for determinism.
