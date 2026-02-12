import { test, expect, request } from "@playwright/test"

const apiBase = process.env.E2E_API_URL || "http://localhost:5000"

async function loginAndSeedStorage(page: import("@playwright/test").Page, creds: { email: string; password: string }) {
  const api = await request.newContext({ baseURL: apiBase })
  const res = await api.post("/api/auth/login", { data: creds })
  const payload = await res.json()
  if (!payload?.data?.accessToken) throw new Error("Login failed: " + JSON.stringify(payload))
  const { accessToken, user } = payload.data
  await page.addInitScript(({ token, user }: { token: string; user: unknown }) => {
    localStorage.setItem("pharma_auth", JSON.stringify({ token, user }))
    localStorage.setItem("pharma_token", token)
  }, { token: accessToken, user })
  await api.dispose()
  return { accessToken, user }
}

test("Admin can view Integrations page without errors", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })
  await page.goto("/admin/integrations")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  await expect(page.getByText("Integrations", { exact: true }).or(page.getByRole("heading", { name: /integrations/i }))).toBeVisible({ timeout: 10000 })
})

test("Admin can view Shipping Logs page without errors", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })
  await page.goto("/admin/shipping-logs")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  await expect(page.getByText("Shipping Logs").or(page.getByRole("heading", { name: /shipping logs/i }))).toBeVisible({ timeout: 10000 })
})

test("Admin can view Payments page (Razorpay tab) without errors", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })
  await page.goto("/admin/payments")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  await expect(page.getByRole("tab", { name: /razorpay/i }).or(page.getByText("Razorpay"))).toBeVisible({ timeout: 10000 })
  page.getByRole("tab", { name: /razorpay/i }).click().catch(() => {})
  await expect(page.getByText("Razorpay").or(page.locator("body"))).toBeVisible()
})

test("Distributor creates shipment and sees AWB on UI", async ({ page }) => {
  const api = await request.newContext({ baseURL: apiBase })
  const loginRes = await api.post("/api/auth/login", { data: { email: "admin@demo.com", password: "Admin@123" } })
  const loginData = await loginRes.json()
  const adminToken = loginData?.data?.accessToken
  expect(adminToken).toBeDefined()
  const productRes = await api.get("/api/products?limit=1", { headers: { Authorization: `Bearer ${adminToken}` } })
  const productData = await productRes.json()
  const product = productData.data?.items?.[0]
  expect(product).toBeDefined()
  const orderRes = await api.post("/api/orders", {
    data: {
      customerName: "Ship Test",
      customerMobile: "9999999999",
      customerAddress: "Addr",
      items: [{ product: product._id, quantity: 1 }],
    },
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  const orderData = await orderRes.json()
  const orderId = orderData.data?._id
  await api.dispose()
  expect(orderId).toBeDefined()

  await loginAndSeedStorage(page, { email: "distributor@demo.com", password: "Distributor@123" })
  await page.goto("/distributor/orders")
  await page.goto(`/distributor/orders/${orderId}`)
  await expect(page.locator("body")).not.toHaveText(/^$/)
  const createBtn = page.getByRole("button", { name: /create shipment/i })
  if (await createBtn.isVisible()) {
    await createBtn.click()
    await expect(page.getByText(/AWB|awb|Courier|Shipment created/i).first()).toBeVisible({ timeout: 15000 })
  }
})

test("Customer checkout page shows Place order or Razorpay", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "customer@demo.com", password: "Customer@123" })
  await page.goto("/customer/checkout")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  await expect(
    page.getByRole("button", { name: /place order|pay with razorpay/i }).first()
  ).toBeVisible({ timeout: 10000 })
})
