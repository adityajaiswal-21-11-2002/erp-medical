import { defineConfig } from "@playwright/test"

export default defineConfig({
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  testDir: "./tests/e2e",
  outputDir: "test-results",
})
