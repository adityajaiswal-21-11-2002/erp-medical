# Manual Test Cases — ERP Medical (PharmaHub)

Formal test cases for QA verification. Check off each case after running. Use demo credentials from `MANUAL_DEMO_GUIDE.md`.

---

## Prerequisites

- [ ] MongoDB running; `.env` has `MONGODB_URI`, `JWT_ACCESS_SECRET`
- [ ] `npm run seed` executed
- [ ] `npm run dev` running; app at **http://localhost:3000**

**Demo credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Admin@123 |
| Retailer | user@demo.com | User@123 |
| Distributor | distributor@demo.com | Distributor@123 |
| Customer | customer@demo.com | Customer@123 |

---

## TC-ADM: Admin Test Cases

### TC-ADM-01: Login & Redirect
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/auth/login?role=admin` | Login form shows | ☐ |
| 2 | Enter admin@demo.com, Admin@123 | Credentials accepted | ☐ |
| 3 | Submit | Redirect to `/admin` or `/admin/dashboard` | ☐ |
| 4 | Sidebar visible | Dashboard, Users, KYC, Products, Orders, etc. | ☐ |

### TC-ADM-02: Users Management
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Users | List of users loads | ☐ |
| 2 | Create new user (name, email, password, accountType) | User created; appears in list | ☐ |
| 3 | Edit user (change accountType to RETAILER) | Changes saved; list updates | ☐ |
| 4 | Search or filter users | Results filtered correctly | ☐ |

### TC-ADM-03: Orders Management
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Orders | Orders table with search/sort | ☐ |
| 2 | Click **View** on an order | Detail drawer opens with order info, line items, shipment | ☐ |
| 3 | Click **Update Status** → set to DELIVERED | Status updates; toast success | ☐ |
| 4 | Click **Set Invoice** → enter INV-001 | Invoice number saved | ☐ |
| 5 | Order without shipment: click **Create shipment** | Shipment created or clear error | ☐ |

### TC-ADM-04: Reports & Export
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Reports | Orders table loads | ☐ |
| 2 | Set date filters (From/To), click **Apply filters** | Filtered orders shown | ☐ |
| 3 | Click **Export CSV** | File downloads (e.g. orders-report-YYYY-MM-DD.csv) | ☐ |
| 4 | Open CSV | Contains orderNumber, customerName, netAmount, status, createdAt | ☐ |

### TC-ADM-05: Shipping Logs
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Shipping Logs | Table loads (or empty state) | ☐ |
| 2 | Filter by Provider (Shiprocket) | Logs filtered | ☐ |
| 3 | Filter by Action (CREATE_ORDER) | Logs filtered | ☐ |
| 4 | Click **Refresh** | Data reloads | ☐ |

### TC-ADM-06: Integrations
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Integrations | Cards for Shiprocket, RapidShyp, Razorpay | ☐ |
| 2 | Click **Test** on Shiprocket | "Connected" or error message (not blank) | ☐ |
| 3 | Click **Test** on Razorpay | Same | ☐ |

### TC-ADM-07: Feature Flags
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Admin → Feature Flags | List of flags (RETURNS_ENABLED, COUPONS_ENABLED, etc.) | ☐ |
| 2 | Toggle RETURNS_ENABLED OFF | Flag saved | ☐ |
| 3 | As Retailer, go to Returns | "Returns disabled by admin" message | ☐ |
| 4 | Toggle RETURNS_ENABLED ON | Flag saved | ☐ |

### TC-ADM-08: Access Denied
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Log out | Redirect to login/home | ☐ |
| 2 | Log in as Retailer (user@demo.com) | Land on retailer dashboard | ☐ |
| 3 | Manually navigate to `/admin/dashboard` | Access denied message (not blank) | ☐ |

---

## TC-RET: Retailer Test Cases

### TC-RET-01: Login & Dashboard
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/auth/login?role=retailer` | Login form | ☐ |
| 2 | Enter user@demo.com, User@123 | Redirect to `/retailer` or `/retailer/dashboard` | ☐ |
| 3 | Dashboard loads | Summary cards / stats visible | ☐ |

### TC-RET-02: KYC Submit
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Complete KYC | KYC form or status | ☐ |
| 2 | Fill required fields, submit | "Under review" or success message | ☐ |
| 3 | Status reflects PENDING or APPROVED | No error | ☐ |

### TC-RET-03: Catalog → Cart → Checkout
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Catalog | Products listed | ☐ |
| 2 | Open a product, add to cart | Cart badge increments | ☐ |
| 3 | Go to Cart | Items shown; quantity editable | ☐ |
| 4 | Go to Checkout | Address form; "Pay & place order" | ☐ |
| 5 | Fill address, click Pay & place order | Razorpay modal (or "Razorpay not configured") | ☐ |
| 6 | Complete payment (or skip if not configured) | Order success; redirect to orders | ☐ |

### TC-RET-04: Orders & Order Detail
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Orders | List of retailer's orders | ☐ |
| 2 | Click **View** on an order | Order detail with items, timeline, shipment | ☐ |
| 3 | Click **Download order summary** | CSV downloads | ☐ |
| 4 | Timeline shows Placed, Payment, Shipped, Delivered | Correct stages | ☐ |

### TC-RET-05: Loyalty
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Loyalty | Points summary, rewards visible | ☐ |
| 2 | Scratch card (if available) | Card scratched; result shown | ☐ |
| 3 | Redeem a reward (within balance) | Success; balance decremented | ☐ |
| 4 | Redeem more than balance | "Insufficient points" or similar error | ☐ |

### TC-RET-06: Affiliate / Referral
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Affiliate | Referral link(s) shown | ☐ |
| 2 | Copy link | Link copied to clipboard | ☐ |
| 3 | Stats show Total Clicks, Conversions | Values (or 0) | ☐ |
| 4 | "Coming soon" for earnings/payout | No hardcoded fake values | ☐ |

### TC-RET-07: Support
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Support | Ticket list | ☐ |
| 2 | Create new ticket (subject, message) | Ticket created | ☐ |
| 3 | Open ticket | Replies visible | ☐ |

---

## TC-DIS: Distributor Test Cases

### TC-DIS-01: Login & Dashboard
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/auth/login?role=distributor` | Login form | ☐ |
| 2 | Enter distributor@demo.com, Distributor@123 | Redirect to distributor dashboard | ☐ |

### TC-DIS-02: Order Queue & Detail
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Orders | Order queue | ☐ |
| 2 | Open an order detail | Full order info, items, shipping section | ☐ |
| 3 | If no shipment: click **Create shipment** | Shipment created or clear error | ☐ |
| 4 | If shipment exists: click **Refresh tracking** | Tracking updated | ☐ |

### TC-DIS-03: Inventory / Invoices / Settlements
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Inventory | Page loads; "Stub data — full ERP integration coming soon" if empty | ☐ |
| 2 | Go to Invoices | Page loads; stub notice if empty | ☐ |
| 3 | Go to Settlements | Page loads; stub notice if empty | ☐ |

---

## TC-CUS: Customer Test Cases

### TC-CUS-01: Login & Catalog
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Open `/auth/login?role=customer` | Login form | ☐ |
| 2 | Enter customer@demo.com, Customer@123 | Storefront / customer view | ☐ |
| 3 | Browse Catalog | Products listed | ☐ |
| 4 | Open product, add to cart | Added to cart | ☐ |

### TC-CUS-02: Checkout & Order
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Cart | Items shown | ☐ |
| 2 | Checkout | Address form; Pay & place order | ☐ |
| 3 | Place order (Razorpay if configured) | Order created; redirect to orders | ☐ |
| 4 | Order list | New order visible | ☐ |

### TC-CUS-03: Order Detail & Tracking
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Open an order | Order detail with items, timeline, tracking | ☐ |
| 2 | Download order summary | CSV downloads | ☐ |
| 3 | Timeline shows Payment, Shipped stages | Correct progression | ☐ |
| 4 | Shipment block (if paid) | Courier, AWB, status shown | ☐ |

### TC-CUS-04: Account & Support
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Go to Account | Profile / account page | ☐ |
| 2 | Go to Support | Create ticket, see list | ☐ |

---

## TC-XROLE: Cross-Role Integration Tests

### TC-XROLE-01: Referral Attribution
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Log in as Retailer | Get referral link from Affiliate page | ☐ |
| 2 | Copy link (e.g. `http://localhost:3000/customer?ref=REF_XXX`) | Link copied | ☐ |
| 3 | Open incognito window; paste link | Storefront loads with ?ref= in URL | ☐ |
| 4 | Log in as Customer (or create account); place order | Order placed | ☐ |
| 5 | Log in as Retailer; go to Affiliate | attributedOrders incremented (or Conversions) | ☐ |

### TC-XROLE-02: Order Visibility
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Customer places order | Order created | ☐ |
| 2 | Admin → Orders | Order visible in list | ☐ |
| 3 | Retailer (who placed order for customer) → Orders | Order visible | ☐ |
| 4 | Distributor → Orders | Order in queue (if applicable) | ☐ |

### TC-XROLE-03: KYC Flow
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Retailer submits KYC | Status PENDING | ☐ |
| 2 | Admin → KYC | Submission in list | ☐ |
| 3 | Admin approves | Status APPROVED | ☐ |
| 4 | Retailer → KYC | Status shows APPROVED | ☐ |

---

## TC-NEG: Negative / Error Cases

### TC-NEG-01: Invalid Login
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Enter wrong password | Error message; no redirect | ☐ |
| 2 | Enter non-existent email | Error message | ☐ |

### TC-NEG-02: Unauthorized API
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Log out; open DevTools; call GET /api/orders with no token | 401 Unauthorized | ☐ |
| 2 | Retailer token; call PATCH /api/feature-flags | 403 Forbidden | ☐ |

### TC-NEG-03: Feature Flag Off
| Step | Action | Expected Result | Pass |
|------|--------|-----------------|------|
| 1 | Admin: set RETURNS_ENABLED OFF | Saved | ☐ |
| 2 | Retailer: go to Returns | "Returns disabled by admin" (not crash) | ☐ |
| 3 | Retailer: go to Schemes; if COUPONS_ENABLED OFF | "Coupons disabled by admin" | ☐ |

---

## Test Execution Log

| Date | Tester | Role | Cases Run | Pass | Fail | Notes |
|------|--------|------|-----------|------|------|-------|
| | | | | | | |

---

## Quick Commands

```bash
npm run dev        # Start app
npm run seed       # Seed demo data
npm run audit:smoke   # API smoke test (app must be running)
npm run test:backend  # Backend unit tests
```
