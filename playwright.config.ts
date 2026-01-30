import { defineConfig } from "@playwright/test"

export default defineConfig({
  timeout: 60000,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    headless: true,
  },
  testDir: "./tests/e2e",
})
