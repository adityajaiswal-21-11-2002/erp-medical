# Shiprocket Create Order 403 – Diagnostic Guide

When **Test** (auth) works but **Create Shipment** returns `403 "Unauthorized. You do not have permission for this action"`, the failure happens on the **create order** API, not auth. This document lists likely causes and how to check them.

---

## 1. Auth vs Create Order – Different Permissions

| Check | Auth (`/v1/external/auth/login`) | Create Order (`/v1/external/orders/create/adhoc`) |
|-------|----------------------------------|--------------------------------------------------|
| What it needs | Email + password | Auth token + create-order permission |
| Our Test button | ✅ Uses this | — |
| Create Shipment | — | ✅ Uses this |

**Conclusion:** Auth success does **not** imply create-order permission. The API user must have the right scopes/roles in Shiprocket.

---

## 2. API User Permissions (Shiprocket Dashboard)

**Check:** Shiprocket → Settings → API → API Users

- Confirm the user in `SHIPROCKET_EMAIL` has **Create Order** (or equivalent) permission.
- Create a new API user with full permissions if unsure.

---

## 3. Account Onboarding / Warehouse

**Check:** Shiprocket Dashboard → Warehouses / Pickup Address

- At least one warehouse with a valid pickup address must exist.
- If missing, create order can return 403 even when auth works.

---

## 4. Request Payload / Data Issues

Our code sends this payload. Any of these can cause problems:

| Field | Our Value | Possible Issue |
|-------|-----------|----------------|
| `order_id` | `order.orderNumber` | Must be unique in Shiprocket; duplicate → 403/400 |
| `billing_customer_name` | `order.customerName` | Required; empty/invalid may fail |
| `billing_phone` | `order.customerMobile` | Must be valid Indian mobile (10 digits) |
| `billing_address` | `order.customerAddress` | Required |
| `billing_city` | Hardcoded `"City"` | Some flows need a real city name |
| `billing_pincode` | Hardcoded `"110001"` | Must be serviceable; some pincodes → 403 |
| `selling_price` | Calculated from item/order | Cannot be 0 or negative |
| `sub_total` | `order.netAmount` | Must be > 0 |
| `order_items` | From order items | At least one item; `selling_price` per item must be valid |

**Check shipping logs:** Admin → Shipping Logs. Inspect the CREATE_ORDER request and response.

---

## 5. Token / Header

**Check:** Code uses `Authorization: Bearer {token}` for create order. Auth refreshes the token when needed.

- If auth test passes just before create shipment, token is likely fine.
- If there’s a long gap, or multiple workers, a stale token could cause 403. Usually Shiprocket returns 401 for bad token, not 403.

---

## 6. Endpoint / Base URL

**Check:** `.env` – `SHIPROCKET_BASE_URL` (default `https://apiv2.shiprocket.in`)

- No trailing slash.
- Use production URL unless you intend sandbox.

---

## 7. Rate Limits

**Check:** If you send many create-order requests quickly, Shiprocket may throttle and return 403.

- Space out requests.
- Use Shipping Logs to confirm timing.

---

## 8. Duplicate Order ID

**Check:** We use `order.orderNumber` as `order_id`.

- If the same `orderNumber` was already sent to Shiprocket, a retry can fail with 403 or another error.
- Verify in Shipping Logs if this order was attempted before.

---

## 9. Data from Our Order

**Check:** The order used for the shipment must have:

- `orderNumber` – present and unique
- `customerName` – non-empty
- `customerMobile` – valid (e.g. 10-digit Indian mobile)
- `customerAddress` – non-empty
- `netAmount` – > 0
- `items` – at least one; each with valid `amount` or usable for `selling_price`

If any of these are missing or invalid, the payload may be rejected.

---

## 10. Recommended Debug Flow

1. Open **Admin → Shipping Logs** and filter by `action: CREATE_ORDER` for the failing shipment.
2. Inspect the **request** payload (order_id, billing_*, items, selling_price, sub_total).
3. Inspect the **response** (exact message and status_code).
4. Ensure:
   - API user has create-order permission
   - Warehouse/pickup address is configured
   - Payload fields are valid and complete
5. If still unclear, contact Shiprocket support with:
   - Exact error message and status code
   - Relevant request payload (redact sensitive data)
   - Timestamp of the request

---

## Quick Checklist

- [ ] API user has create-order permission
- [ ] At least one warehouse / pickup address configured
- [ ] Order has valid customerName, customerMobile, customerAddress, netAmount
- [ ] `order_id` (orderNumber) is unique in Shiprocket
- [ ] No `selling_price` = 0 and sub_total > 0
- [ ] `billing_pincode` is serviceable (or use real pincode from address)
- [ ] Shipping Logs show exact request/response for CREATE_ORDER
