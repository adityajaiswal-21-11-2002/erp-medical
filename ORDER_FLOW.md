# Order Placement Flow — What Happens Step by Step

This document describes what happens when a customer places an order: payment with Razorpay and automatic shipment creation (Shiprocket/RapidShyp).

---

## 1. Customer Checkout (Place Order)

**Payment is required:** there is no “pay later” option. The customer must pay with Razorpay to place an order.

| Step | What happens |
|------|----------------|
| 1 | User fills delivery address and clicks **“Pay & place order”**. |
| 2 | Frontend calls **POST /api/orders** with customer details + cart items. |
| 3 | **Server:** Order is created in DB (order number, line items, stock decremented; referral/analytics/loyalty updated). |
| 4 | Frontend gets `orderId`, then calls **POST /api/payments/razorpay/order** with `{ orderId }`. |
| 5 | **Server:** Razorpay order is created; `Payment` record saved (status `CREATED`). Returns keyId, razorpayOrderId, amount, etc. |
| 6 | Frontend opens **Razorpay checkout modal** (Card, UPI, Netbanking). |
| 7 | User completes payment in Razorpay. |
| 8 | Frontend calls **POST /api/payments/razorpay/verify** with payment details and `internalOrderId`. |
| 9 | **Server:** Signature verified, `Payment` set to `CAPTURED`, loyalty credited. **Shipment is created automatically** for this order (Shiprocket or RapidShyp per `DEFAULT_SHIPPING_PROVIDER`). |
| 10 | Frontend clears cart, shows success, redirects to **/customer/orders**. |

If Razorpay is not configured (`RAZORPAY_KEY_ID` missing in .env), checkout fetches the key from the API; if empty, it shows a message and the button is disabled.

---

## 2. Shipment (Shiprocket / RapidShyp) — Automatic

Shipment is **no longer a manual step**. It is created automatically when payment is verified.

| When | What happens |
|------|----------------|
| After **POST /api/payments/razorpay/verify** (payment CAPTURED) | Server calls `createShipmentForOrderIdInternal(orderId)`, which uses the default shipping provider (`DEFAULT_SHIPPING_PROVIDER` env, default `SHIPROCKET`) to create the order on Shiprocket/RapidShyp and assign AWB. |
| Razorpay **webhook** (`payment.captured` or `order.paid`) | Same: shipment is created for the order if not already present. |

If the shipping provider is not configured or the API call fails, payment verification still succeeds; shipment creation fails silently (order is paid, shipment can be retried later via API if needed).

**Who can see shipment data**

- **Admin:** Orders list → **View** on an order → drawer shows **Shipment (Shiprocket / RapidShyp)** with provider, AWB, courier, status (or “Created automatically after payment, or pending.” if none yet).
- **Distributor:** Order detail page (**/distributor/orders/:id**) shows the same shipment block (AWB, courier, status, **Refresh tracking**). If no shipment yet, a message explains it is created automatically after payment.
- **Customer:** Order detail can show shipment/tracking if the app fetches and displays it.

There is **no manual “Create shipment”** action in the main flow; Admin/Distributor only **view** shipment data. The **Integrations** page (Admin) still has **Test** for Shiprocket and RapidShyp to check connectivity.

---

## 3. Summary Diagram

```
Customer checkout
       │
       └─ "Pay & place order" (Razorpay only)
             → POST /api/orders (order created)
             → POST /api/payments/razorpay/order (Razorpay order + Payment record)
             → Razorpay modal opens → user pays
             → POST /api/payments/razorpay/verify
             → Payment CAPTURED, loyalty credited
             → Shipment created automatically (Shiprocket/RapidShyp)
             → Redirect to /customer/orders

Admin / Distributor:
  → View order → see Shipment section (provider, AWB, courier, status)
  → No manual "Create shipment" step
```

---

**Files involved**

- Order: `server/controllers/orderController.ts`, `server/services/orderService.ts`
- Checkout (Razorpay only): `app/customer/checkout/page.tsx`
- Razorpay: `server/controllers/razorpayController.ts` (verify + webhook call `createShipmentForOrderIdInternal`)
- Shipment: `server/controllers/shipmentController.ts` (`createShipmentForOrderIdInternal`, used after payment and by POST `/api/shipments/:orderId/create` for manual retry if needed)
- Admin orders: `app/admin/orders/page.tsx` (drawer shows shipment)
- Distributor order detail: `app/distributor/orders/[id]/page.tsx` (shipment display, no create button)
- Integrations (Shiprocket/RapidShyp test): `app/admin/integrations/page.tsx`
