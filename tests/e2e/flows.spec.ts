import { test, expect, request } from "@playwright/test"

const apiBase = process.env.E2E_API_URL || "http://localhost:5000"

async function loginAndSeedStorage(page: any, creds: { email: string; password: string }) {
  const api = await request.newContext({ baseURL: apiBase })
  const res = await api.post("/api/auth/login", { data: creds })
  const payload = await res.json()
  const { accessToken, user } = payload.data
  await page.addInitScript(({ token, user }: any) => {
    localStorage.setItem("pharma_auth", JSON.stringify({ token, user }))
    localStorage.setItem("pharma_token", token)
  }, { token: accessToken, user })
  await api.dispose()
  return { accessToken, user }
}

test("Admin flow: flags, banner, analytics", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })

  await page.goto("/admin/feature-flags")
  const switches = page.getByRole("switch")
  await switches.first().click()
  await switches.nth(1).click()

  await page.goto("/admin/banners")
  await page.getByRole("button", { name: "New Banner" }).click()
  await page.getByPlaceholder("Title").fill("E2E Promo")
  await page.getByRole("button", { name: "Create" }).click()

  await page.goto("/admin/analytics")
  await expect(page.getByText("User Analytics")).toBeVisible()
})

test("Retailer flow: KYC, order, points", async ({ page }) => {
  const retailer = await loginAndSeedStorage(page, { email: "user@demo.com", password: "User@123" })

  await page.goto("/retailer/kyc")
  await page.getByPlaceholder("Enter shop name").fill("E2E Pharmacy")
  await page.getByRole("button", { name: "Next" }).click()
  await page.getByRole("button", { name: "Next" }).click()
  await page.getByPlaceholder("15-digit GST number").fill("22AAAAA0000A1Z5")
  await page.getByRole("button", { name: "Next" }).click()
  await page.getByRole("button", { name: "Submit KYC" }).click()

  const api = await request.newContext({ baseURL: apiBase })
  const productRes = await api.get("/api/products?limit=1", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const productData = await productRes.json()
  const product = productData.data.items[0]
  await api.dispose()

  await page.goto("/retailer/catalog")
  await page.evaluate((prod: any) => {
    localStorage.setItem("pharma_cart", JSON.stringify([
      { productId: prod._id, name: prod.name, mrp: prod.mrp, quantity: 1 },
    ]))
  }, product)

  await page.goto("/retailer/checkout")
  await page.getByPlaceholder("Customer name").fill("Test Customer")
  await page.getByPlaceholder("Customer mobile").fill("9999999999")
  await page.getByPlaceholder("Customer address").fill("Test Address")
  await page.getByRole("button", { name: "Place Order" }).click()

  await page.goto("/retailer/loyalty")
  await expect(page.getByText("Your Loyalty Points")).toBeVisible()
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
  const refCode = ref.data.refCode

  const productRes = await api.get("/api/products?limit=1", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const productData = await productRes.json()
  const product = productData.data.items[0]
  await api.dispose()

  await loginAndSeedStorage(page, { email: "customer@demo.com", password: "Customer@123" })
  await page.goto(`/customer?ref=${refCode}`)
  await page.evaluate((prod: any) => {
    localStorage.setItem("pharma_cart", JSON.stringify([
      { productId: prod._id, name: prod.name, mrp: prod.mrp, quantity: 1 },
    ]))
  }, product)
  await page.goto("/customer/checkout")
  await page.getByRole("button", { name: "Place order" }).click()

  const apiCheck = await request.newContext({ baseURL: apiBase })
  const updated = await apiCheck.get("/api/referrals/me", {
    headers: { Authorization: `Bearer ${retailer.accessToken}` },
  })
  const updatedData = await updated.json()
  expect(updatedData.data.attributedOrders).toBeGreaterThan(0)
  await apiCheck.dispose()
})
