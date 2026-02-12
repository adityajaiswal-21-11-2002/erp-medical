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

const adminRoutes = [
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/kyc",
  "/admin/products",
  "/admin/orders",
  "/admin/feature-flags",
  "/admin/erp-sync",
  "/admin/loyalty",
  "/admin/payments",
  "/admin/integrations",
  "/admin/shipping-logs",
  "/admin/analytics",
  "/admin/compliance",
  "/admin/banners",
  "/admin/tickets",
  "/admin/reports",
]

test("Admin: every menu page loads without blank screen or 404", async ({ page }) => {
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })

  for (const path of adminRoutes) {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator("body")).not.toHaveText(/^$/, { timeout: 5000 })
    const bodyText = await page.locator("body").innerText()
    expect(bodyText.length).toBeGreaterThan(50)
    if (bodyText.includes("Access Denied") || bodyText.includes("404")) {
      throw new Error(`Admin page ${path} showed Access Denied or 404`)
    }
  }
})

test("Admin: no critical console errors on key pages", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    const text = msg.text()
    if (msg.type() === "error" && !text.includes("ResizeObserver") && !text.includes("favicon")) {
      errors.push(text)
    }
  })
  await loginAndSeedStorage(page, { email: "admin@demo.com", password: "Admin@123" })
  await page.goto("/admin/dashboard")
  await page.goto("/admin/orders")
  await page.goto("/admin/kyc")
  const critical = errors.filter((e) => !e.includes("ResizeObserver") && !e.includes("favicon"))
  expect(critical.length).toBe(0)
})
