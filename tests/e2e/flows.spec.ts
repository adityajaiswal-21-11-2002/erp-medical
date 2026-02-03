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

test("Admin flow: flags, ERP Sync, KYC, analytics", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })

  await page.goto("/admin/feature-flags")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  const switches = page.getByRole("switch")
  await expect(switches.first()).toBeVisible()
  await switches.first().click()
  await switches.nth(1).click()

  await page.goto("/admin/erp-sync")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  const syncBtn = page.getByRole("button", { name: /sync|run/i }).first()
  if (await syncBtn.isVisible()) await syncBtn.click()

  await page.goto("/admin/banners")
  await page.getByRole("button", { name: "New Banner" }).click()
  await page.getByPlaceholder("Title").fill("E2E Promo")
  await page.getByRole("button", { name: "Create" }).click()

  await page.goto("/admin/analytics")
  await expect(page.getByText("User Analytics").or(page.getByText("Analytics"))).toBeVisible({ timeout: 10000 })
})

test("Retailer flow: KYC, order, points", async ({ page }) => {
  const retailer = await loginAndSeedStorage(page, { email: "user@demo.com", password: "User@123" })

  await page.goto("/retailer/kyc")
  await expect(page.locator("body")).not.toHaveText(/^$/)
  const shopInput = page.getByPlaceholder("Enter shop name").or(page.getByPlaceholder(/shop|business/i))
  await shopInput.first().fill("E2E Pharmacy")
  await page.getByRole("button", { name: "Next" }).first().click()
  await page.getByRole("button", { name: "Next" }).first().click()
  await page.getByPlaceholder("15-digit GST number").or(page.getByPlaceholder(/GST/i)).fill("22AAAAA0000A1Z5")
  await page.getByRole("button", { name: "Next" }).first().click()
  await page.getByRole("button", { name: "Submit KYC" }).click()

  const api = await request.newContext({ baseURL: apiBase })
  const productRes = await api.get("/api/products?limit=1", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const productData = await productRes.json()
  const product = productData.data?.items?.[0]
  await api.dispose()
  expect(product).toBeDefined()

  await page.goto("/retailer/catalog")
  await page.evaluate((prod: { _id: string; name: string; mrp: number }) => {
    localStorage.setItem("pharma_cart", JSON.stringify([
      { productId: prod._id, name: prod.name, mrp: prod.mrp, quantity: 1 },
    ]))
  }, product)

  await page.goto("/retailer/checkout")
  await expect(page.getByRole("button", { name: "Place Order" })).toBeVisible()
  await page.getByPlaceholder("Customer name").fill("Test Customer")
  await page.getByPlaceholder("Customer mobile").fill("9999999999")
  await page.getByPlaceholder("Customer address").fill("Test Address")
  await page.getByRole("button", { name: "Place Order" }).click()

  await page.goto("/retailer/loyalty")
  await expect(page.getByText("Your Loyalty Points").or(page.getByText(/loyalty|points/i))).toBeVisible({ timeout: 10000 })
})

test("Distributor flow: approve and ship", async ({ page }) => {
  const admin = await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })
  const api = await request.newContext({ baseURL: apiBase })
  const productRes = await api.get("/api/products?limit=1", {
    headers: { Authorization: `Bearer ${admin.accessToken}` },
  })
  const productData = await productRes.json()
  const product = productData.data.items[0]
  await api.post("/api/orders", {
    data: {
      customerName: "Retailer Test",
      customerMobile: "9999999999",
      customerAddress: "Test Address",
      items: [{ product: product._id, quantity: 1 }],
    },
    headers: { Authorization: `Bearer ${admin.accessToken}` },
  })
  await api.dispose()

  await loginAndSeedStorage(page, { email: "distributor@demo.com", password: "Distributor@123" })
  await page.goto("/distributor/orders")
  const firstRow = page.locator("table tbody tr").first()
  await firstRow.getByRole("button").click()
  await page.getByRole("menuitem", { name: "Accept" }).click()
  await page.getByRole("button", { name: "Accept" }).click()

  await firstRow.getByRole("button").click()
  await page.getByRole("menuitem", { name: "Mark shipped" }).click()
})

test("Customer flow: referral purchase attribution", async ({ page }) => {
  const retailer = await loginAndSeedStorage(page, { email: "user@demo.com", password: "User@123" })
  const api = await request.newContext({ baseURL: apiBase })
  const refRes = await api.get("/api/referrals/me", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const ref = await refRes.json()
  const refCode = ref?.data?.refCode ?? "REF-DEMO1"

  const productRes = await api.get("/api/products?limit=1", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const productData = await productRes.json()
  const product = productData.data?.items?.[0]
  await api.dispose()
  expect(product).toBeDefined()

  await loginAndSeedStorage(page, { email: "customer@demo.com", password: "Customer@123" })
  await page.goto(`/customer?ref=${refCode}`)
  await page.evaluate((prod: { _id: string; name: string; mrp: number }) => {
    localStorage.setItem("pharma_cart", JSON.stringify([
      { productId: prod._id, name: prod.name, mrp: prod.mrp, quantity: 1 },
    ]))
  }, product)
  await page.goto("/customer/checkout")
  await expect(page.getByRole("button", { name: /place order|place order/i })).toBeVisible()
  await page.getByRole("button", { name: /place order|place order/i }).click()

  const apiCheck = await request.newContext({ baseURL: apiBase })
  const updated = await apiCheck.get("/api/referrals/me", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const updatedData = await updated.json()
  expect(updatedData?.data?.attributedOrders ?? 0).toBeGreaterThan(0)
  await apiCheck.dispose()
})
