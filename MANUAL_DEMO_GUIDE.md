# Manual Feature Demo Guide — Per Role

Use this guide to manually check each feature for each role. Do one role at a time; log out before switching roles.

---

## Before You Start

1. **Start the app**
   - From project root: `npm run dev` (or `npm run dev:all` if using separate backend).
   - Open: **http://localhost:3000**

2. **Seed demo data** (if not done already)
   - `npm run seed`
   - This creates 4 users + products + feature flags.

3. **Demo credentials**

| Role        | Email              | Password      |
|------------|--------------------|---------------|
| **Admin**  | admin@demo.com     | Admin@123     |
| **Retailer** | user@demo.com    | User@123      |
| **Distributor** | distributor@demo.com | Distributor@123 |
| **Customer** | customer@demo.com | Customer@123  |

4. **Login by role**
   - Home page → click the role card (Admin / Retailer / Distributor / Customer) **or** go directly:
   - Admin: http://localhost:3000/auth/login?role=admin  
   - Retailer: http://localhost:3000/auth/login?role=retailer  
   - Distributor: http://localhost:3000/auth/login?role=distributor  
   - Customer: http://localhost:3000/auth/login?role=customer  

---

# 1. Admin — Feature Demo Checklist

Log in as **admin@demo.com** / **Admin@123**. Use the sidebar to reach each section.

| # | Feature | Steps to verify |
|---|---------|-----------------|
| **1.1** | **Login & redirect** | 1. Go to `/auth/login?role=admin`. 2. Enter admin@demo.com, Admin@123. 3. Submit. 4. You should land on `/admin` or `/admin/dashboard`. |
| **1.2** | **Dashboard** | 1. Click **Dashboard** in sidebar. 2. Page loads at `/admin/dashboard` with summary cards/stats (no blank screen). |
| **1.3** | **Users + role/accountType** | 1. Go to **Users** (`/admin/users`). 2. See list of users. 3. Create a new user: set name, email, password, **accountType** (Admin/Retailer/Distributor/Customer). 4. Save. 5. Edit same user: change accountType or name, save. 6. Confirm list updates. |
| **1.4** | **KYC — approve/reject** | 1. Go to **KYC** (`/admin/kyc`). 2. See list of KYC submissions (retailer). 3. Open one submission. 4. **Approve** or **Reject**. 5. Confirm status updates. |
| **1.5** | **Feature flags** | 1. Go to **Feature Flags** (`/admin/feature-flags`). 2. See list (e.g. RETURNS_ENABLED, COUPONS_ENABLED). 3. **Toggle** one flag on/off. 4. Confirm it saves (UI reflects new state). |
| **1.6** | **ERP sync + logs** | 1. Go to **ERP Sync** (`/admin/erp-sync`). 2. See sync logs list. 3. (Optional) Trigger a sync if button exists. 4. Use **Retry** on a log entry if available. 5. Confirm logs load and retry doesn’t error. |
| **1.7** | **Orders + invoice** | 1. Go to **Orders** (`/admin/orders`). 2. See orders list. 3. Open an order detail. 4. If order has no invoice: use **Set Invoice** (or similar) and enter invoice number, save. 5. Confirm invoice appears on order. |
| **1.8** | **Payments + Razorpay** | 1. Go to **Payments** (`/admin/payments`). 2. See payments list. 3. Check Razorpay / webhook events section if present. 4. Page loads without error. |
| **1.9** | **Shipping logs + create/track** | 1. Go to **Shipping Logs** (`/admin/shipping-logs`). 2. See shipment logs. 3. From an order (admin orders or link from here), try **Create Shipment** if available. 4. **Track** a shipment. 5. Confirm no blank screen or 500. |
| **1.10** | **Loyalty & reward catalog** | 1. Go to **Loyalty & Schemes** (`/admin/loyalty`). 2. See loyalty summary / ledgers. 3. See or **add** reward catalog items. 4. Confirm save works. |
| **1.11** | **Integrations (Shiprocket/Razorpay test)** | 1. Go to **Integrations** (`/admin/integrations`). 2. See Shiprocket and/or RapidShyp and Razorpay. 3. Click **Test** for each (if configured). 4. See “Connected” or clear error message, not blank. |
| **1.12** | **Analytics** | 1. Go to **Analytics** (`/admin/analytics`). 2. Page loads with charts/summary. 3. No blank screen. |
| **1.13** | **Compliance logs** | 1. Go to **Compliance** (`/admin/compliance`). 2. See compliance logs list (may be empty). 3. Page loads. |
| **1.14** | **Banners** | 1. Go to **Banners** (`/admin/banners`). 2. See list. 3. **Add** a banner (title, image/link if required). 4. **Edit** one. 5. Confirm list updates. |
| **1.15** | **Tickets** | 1. Go to **Tickets** (`/admin/tickets`). 2. See ticket list. 3. Open a ticket, add reply if option exists. 4. Confirm updates. |
| **1.16** | **Reports** | 1. Go to **Reports** (`/admin/reports`). 2. Page loads. 3. Use **Orders CSV export** (or similar). 4. File downloads or data shown. |
| **1.17** | **Products** | 1. Go to **Products** (`/admin/products`). 2. See product list. 3. Create/edit a product. 4. Confirm CRUD works. |
| **1.18** | **Access denied (other role)** | 1. Log out. 2. Log in as retailer (user@demo.com). 3. Manually go to `/admin/dashboard`. 4. You should see **Access denied** (not blank). |

---

# 2. Retailer — Feature Demo Checklist

Log out, then log in as **user@demo.com** / **User@123**.

| # | Feature | Steps to verify |
|---|---------|-----------------|
| **2.1** | **Login & redirect** | 1. `/auth/login?role=retailer`. 2. user@demo.com, User@123. 3. Land on `/retailer` or `/retailer/dashboard`. |
| **2.2** | **Dashboard** | 1. **Dashboard** → `/retailer/dashboard` loads. |
| **2.3** | **KYC submit + status** | 1. Go to **Complete KYC** (`/retailer/kyc`). 2. If status is Pending, fill and **Submit** KYC. 3. Confirm status message updates (e.g. “Under review”). 4. If already approved, confirm status is shown. |
| **2.4** | **Catalog** | 1. Go to **Catalog** (`/retailer/catalog`). 2. See products. 3. Open a product (`/retailer/catalog/[sku]`). 4. Add to cart. |
| **2.5** | **Cart** | 1. Go to **Cart** (`/retailer/cart`). 2. See items. 3. Change quantity or remove. 4. Go to checkout. |
| **2.6** | **Checkout + place order** | 1. **Checkout** (`/retailer/checkout`). 2. Fill address/details if needed. 3. **Place order**. 4. Confirm order success and you get an order ID or redirect to orders. |
| **2.7** | **Orders list + detail** | 1. **Orders** (`/retailer/orders`). 2. See your orders. 3. Open one (`/retailer/orders/[id]`). 4. See status and timeline. |
| **2.8** | **Coupons (when enabled)** | 1. Go to **Schemes & Coupons** (`/retailer/schemes`). 2. If admin has **COUPONS_ENABLED** ON: see coupons, apply in cart/checkout if supported. 3. If OFF: page should show “Coupons disabled by admin” (or similar), not crash. |
| **2.9** | **Returns (when enabled)** | 1. Go to **Returns** (`/retailer/returns`). 2. If **RETURNS_ENABLED** ON: see returns, create return for an order. 3. If OFF: see “Returns disabled by admin”. |
| **2.10** | **Loyalty** | 1. **Loyalty** (`/retailer/loyalty`). 2. See points summary. 3. Use **Scratch** card if available. 4. **Redeem** a reward. 5. Confirm points/balance update or success message. |
| **2.11** | **Payments** | 1. **Payments** (`/retailer/payments`). 2. Page loads (payment history or instructions). |
| **2.12** | **Affiliate / referral** | 1. **Affiliate** (`/retailer/affiliate`). 2. See your **referral link**. 3. Copy it. 4. See referral/affiliate stats if shown. |
| **2.13** | **Support tickets** | 1. **Support** (`/retailer/support`). 2. See your tickets. 3. **Create** a new ticket (subject, message). 4. Open it and check replies. |
| **2.14** | **Profile** | 1. **Profile** (`/retailer/profile`). 2. View or edit profile. 3. Save. Confirm no error. |

---

# 3. Distributor — Feature Demo Checklist

Log out, then log in as **distributor@demo.com** / **Distributor@123**.

| # | Feature | Steps to verify |
|---|---------|-----------------|
| **3.1** | **Login & redirect** | 1. `/auth/login?role=distributor`. 2. distributor@demo.com, Distributor@123. 3. Land on `/distributor` or `/distributor/dashboard`. |
| **3.2** | **Dashboard** | 1. **Dashboard** → `/distributor/dashboard` loads. |
| **3.3** | **Order queue** | 1. **Orders** (`/distributor/orders`). 2. See list of orders (queue). |
| **3.4** | **Order detail + approve/reject** | 1. Open an order (`/distributor/orders/[id]`). 2. See full detail. 3. **Approve** or **Reject** (if buttons exist). 4. Confirm status updates. |
| **3.5** | **Create shipment + track** | 1. On same order detail page. 2. **Create Shipment** (or similar). 3. Confirm AWB/shipment info appears (or friendly message if provider not configured). 4. **Track** shipment. |
| **3.6** | **Inventory** | 1. **Inventory** (`/distributor/inventory`). 2. Page loads (may show “No data” or stub list). |
| **3.7** | **Invoices** | 1. **Invoices** (`/distributor/invoices`). 2. Page loads (stub OK: “No invoices”). |
| **3.8** | **Settlements** | 1. **Settlements** (`/distributor/settlements`). 2. Page loads (stub OK). |
| **3.9** | **Analytics** | 1. **Analytics** (`/distributor/analytics`). 2. Page loads. |
| **3.10** | **Returns** | 1. **Returns** (`/distributor/returns`). 2. If returns enabled: see list, process one. 3. If disabled: “Returns disabled by admin”. |
| **3.11** | **Retailers** | 1. **Retailers** (`/distributor/retailers`). 2. Page loads. |
| **3.12** | **Support** | 1. **Support** (`/distributor/support`). 2. Create ticket, see list. |
| **3.13** | **Profile** | 1. **Profile** (`/distributor/profile`). 2. View/edit, save. |

---

# 4. Customer — Feature Demo Checklist

Log out, then log in as **customer@demo.com** / **Customer@123**.

| # | Feature | Steps to verify |
|---|---------|-----------------|
| **4.1** | **Login & redirect** | 1. `/auth/login?role=customer`. 2. customer@demo.com, Customer@123. 3. Land on `/customer` or storefront. |
| **4.2** | **Storefront / catalog** | 1. Browse **Catalog** (`/customer/catalog`). 2. Open a product (`/customer/product/[sku]`). 3. Add to cart. |
| **4.3** | **Cart** | 1. **Cart** (`/customer/cart`). 2. See items, go to checkout. |
| **4.4** | **Checkout + order** | 1. **Checkout** (`/customer/checkout`). 2. Complete flow; **Place order** (Razorpay or test mode). 3. Confirm order success. |
| **4.5** | **Orders** | 1. **Orders** (or Account → Orders) (`/customer/orders`). 2. See list. 3. Open one (`/customer/orders/[id]`). 4. See status/timeline. |
| **4.6** | **Referral link (?ref=)** | 1. Copy retailer’s referral link (e.g. from retailer affiliate page): `...?ref=RET123` or similar. 2. Open in **incognito** or different browser. 3. Browse and place order as customer. 4. Log in as retailer; check **Affiliate** page for attribution (referral tracked). |
| **4.7** | **Account** | 1. **Account** (`/customer/account`). 2. Page loads, view/edit if available. |
| **4.8** | **Support** | 1. **Support** (`/customer/support`). 2. Create ticket, see list. |

---

# Quick Reference — Routes by Role

- **Admin:** `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/kyc`, `/admin/products`, `/admin/orders`, `/admin/feature-flags`, `/admin/erp-sync`, `/admin/loyalty`, `/admin/payments`, `/admin/integrations`, `/admin/shipping-logs`, `/admin/analytics`, `/admin/compliance`, `/admin/banners`, `/admin/tickets`, `/admin/reports`
- **Retailer:** `/retailer/dashboard`, `/retailer/kyc`, `/retailer/catalog`, `/retailer/cart`, `/retailer/checkout`, `/retailer/orders`, `/retailer/returns`, `/retailer/schemes`, `/retailer/loyalty`, `/retailer/payments`, `/retailer/affiliate`, `/retailer/support`, `/retailer/profile`
- **Distributor:** `/distributor/dashboard`, `/distributor/orders`, `/distributor/inventory`, `/distributor/invoices`, `/distributor/settlements`, `/distributor/analytics`, `/distributor/returns`, `/distributor/retailers`, `/distributor/support`, `/distributor/profile`
- **Customer:** `/customer/catalog`, `/customer/cart`, `/customer/checkout`, `/customer/orders`, `/customer/account`, `/customer/support`

---

# Tips

- **Logout** between roles: use the logout option in the UI (or clear session) so the next login is clearly for the new role.
- **Feature flags:** To test Retailer **Coupons** and **Returns**, turn ON `COUPONS_ENABLED` and `RETURNS_ENABLED` in Admin → Feature Flags, then retest retailer flows.
- **Referral:** Customer referral attribution is often tied to visiting with `?ref=...` before ordering; use incognito to simulate a new user.
- If a page is **blank**: check browser console (F12) and network tab; note the route and role for debugging.

Use this document as your checklist: tick each step or feature as you verify it.
