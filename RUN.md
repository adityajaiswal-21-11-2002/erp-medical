# Run & Integration Guide

## Environment Variables

### Backend (.env or env.example)

Copy `env.example` to `.env` and set:

**Required for all:**
- `MONGODB_URI` – MongoDB connection string
- `JWT_ACCESS_SECRET` or `JWT_SECRET`
- `CLIENT_ORIGIN` – e.g. `http://localhost:3000`
- `PORT` – e.g. `5000`

**Shiprocket:**
- `SHIPROCKET_EMAIL` – API user email (create via Shiprocket Dashboard → Settings → API → Create API User)
- `SHIPROCKET_PASSWORD` – API user password
- `SHIPROCKET_BASE_URL` – optional; default `https://apiv2.shiprocket.in`

**RapidShyp:**
- `RAPIDSHYP_API_KEY` – from RapidShyp portal (Settings / API)
- `RAPIDSHYP_BASE_URL` – optional; default `https://api.rapidshyp.com`

**Razorpay (IDFC):**
- `RAZORPAY_KEY_ID` – from Razorpay Dashboard → Settings → API Keys (public key; frontend gets it via GET /api/payments/razorpay/key)
- `RAZORPAY_KEY_SECRET` – API secret (server only; never expose in frontend)
- `RAZORPAY_WEBHOOK_SECRET` – from Dashboard → Webhooks → Add endpoint → copy secret. **Optional for now:** if empty or left as placeholder (e.g. `your_webhook_secret`), create order and verify payment still work; only the webhook endpoint will return 503 until you set a real secret.

**Other:**
- `DEFAULT_SHIPPING_PROVIDER` – `SHIPROCKET` or `RAPIDSHYP` (default: `SHIPROCKET`)
- `PUBLIC_APP_URL` – e.g. `http://localhost:3000` (for webhook/redirect URLs)

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL` – backend base URL, e.g. `http://localhost:5000` (leave empty to use Next.js API routes)
- Frontend checkout uses `RAZORPAY_KEY_ID` via API (GET /api/payments/razorpay/key); no separate frontend env needed.

---

## Configuring Integrations

### Shiprocket

1. Log in to [Shiprocket](https://app.shiprocket.in).
2. Go to **Settings → API → Configure → Create an API User** (use an email different from your login).
3. Copy the API user email and password into `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD`.
4. The app uses: Auth (token), Create Order (adhoc), Assign AWB, Track by AWB.

### RapidShyp

1. Log in to RapidShyp portal.
2. Go to **Settings** (or API / Integrations) and generate or copy your **API key**.
3. Set `RAPIDSHYP_API_KEY` in backend env.
4. Tracking is implemented via `POST /rapidshyp/apis/v1/track_order` with header `rapidshyp-token`.

### Razorpay

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. **Settings → API Keys**: generate Key ID and Key Secret; set in backend.
3. **Settings → Webhooks**: Add endpoint:
   - URL: `https://your-domain.com/api/webhooks/razorpay` (or `http://localhost:3000/api/webhooks/razorpay` for dev)
   - Events: `payment.captured`, `payment.failed`, `order.paid`
4. Copy the **Webhook Secret** into `RAZORPAY_WEBHOOK_SECRET`.
5. Frontend gets Razorpay key from API; ensure `RAZORPAY_KEY_ID` is set in .env.

---

## Integration Checklist

- [ ] Backend `.env` has `MONGODB_URI`, JWT secrets, and (optional) shipping/Razorpay vars.
- [ ] `.env` has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for online payment (frontend gets key via API).
- [ ] Shiprocket: API user created and credentials set; admin can use “Test” on Integrations page.
- [ ] RapidShyp: API key set; admin can use “Test” on Integrations page.
- [ ] Razorpay: Key ID + Secret in backend; Webhook URL added and secret set; public key in frontend.
- [ ] Webhooks: Shiprocket/RapidShyp/Razorpay webhook URLs point to your deployed base URL + `/api/webhooks/{provider}`.

---

## Troubleshooting

**Shiprocket “Connection failed”**  
- Check `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` (API user, not main login).  
- Ensure base URL is `https://apiv2.shiprocket.in` (no trailing slash).

**RapidShyp “Not connected”**  
- Confirm `RAPIDSHYP_API_KEY` is set and valid.  
- Check `RAPIDSHYP_BASE_URL` if you use a custom endpoint.

**Razorpay “Razorpay is not configured”**  
- Set both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend.

**Razorpay webhook “Invalid signature”**  
- Use the exact Webhook Secret from the dashboard for the same endpoint URL.  
- Backend must verify using the **raw** request body (already handled in Next.js route with `rawBody`).

**Duplicate shipments or double payment/loyalty**  
- Shipments: create is idempotent (returns existing if not `force`).  
- Payments: verify and webhook both check `Payment.status === "CAPTURED"` before updating.  
- Loyalty: credited only once per order via `RAZORPAY_CAPTURE` and `metadata.orderId` check.

**Admin Integrations / Shipping Logs / Payments pages 404**  
- Ensure you’re logged in as a user with `accountType` ADMIN and that routes are mounted at `/api/shipments`, `/api/payments`, `/api/webhooks`.

---

## Running the App

- **Frontend only (uses Next.js API routes):**  
  `npm run dev`  
  No separate backend; set `NEXT_PUBLIC_API_URL` empty or omit.

- **Backend + Frontend:**  
  `npm run dev:all`  
  Backend: `http://localhost:5000`, Frontend: `http://localhost:3000`.  
  Set `NEXT_PUBLIC_API_URL=http://localhost:5000` in frontend.

- **Seed demo data:**  
  `npm run seed`  
  Creates admin, retailer, distributor, customer users + products + flags. Use same MONGODB_URI for Next and backend.

- **API smoke audit:**  
  `npm run audit:smoke`  
  Hits key API endpoints (requires dev server). Set `AUDIT_API_URL=http://localhost:3000` when using Next.js only.

- **Backend tests:**  
  `npm run test:backend`  
  Uses Jest; mocks external APIs (Razorpay, Shiprocket, RapidShyp). See `FINAL_REPORT.md`.

- **E2E tests:**  
  `npm run test:e2e`  
  Uses Playwright. First run: `npx playwright install` to download browsers. Ensure backend and frontend are running (e.g. `npm run dev:all`). Set `E2E_BASE_URL=http://localhost:3000`, `E2E_API_URL=http://localhost:5000`.

- **Test mode / mocks:**  
  Backend tests mock Razorpay (orders.create), shipping (shippingStub). No live API calls. For deterministic seed: `SEED_DETERMINISTIC=1 npm run backend:seed`.

---

## Test Report

Run and then fill in results:

**1. Backend unit tests**

```bash
cd backend && npm install && npm test
# or from repo root: npm run test:backend
```

- **Shipments** (`shipments.test.ts`): create idempotency, track updates status, webhook idempotent.
- **Razorpay** (`razorpay.test.ts`): create order payload, verify signature (mock), webhook idempotent, payment.captured no double-credit.

Result: PASS / FAIL  
If FAIL: list failing test file names and describe errors.

**2. E2E tests**

```bash
# Start app (e.g. npm run dev or dev:all), then:
npm run test:e2e
```

- Admin: Integrations, Shipping Logs, Payments pages load without errors.
- Distributor: order detail, Create Shipment, see AWB (when provider configured or mocked).
- Customer: checkout shows Place order / Razorpay.

Result: PASS / FAIL  
If FAIL: list failing spec/test names (e.g. `integrations.spec.ts`, `flows.spec.ts`).

**Sample summary (replace with your run):**

| Suite           | Result | Failing tests (if any) |
|-----------------|--------|-------------------------|
| Backend unit    | PASS   | 46 tests, 12 suites     |
| E2E (Playwright)| Run manually | Requires dev:all  |
