import dotenv from "dotenv"
import fs from "fs"
import path from "path"

const localEnv = path.resolve(process.cwd(), ".env")
const rootEnv = path.resolve(process.cwd(), "..", ".env")
const testEnv = path.resolve(process.cwd(), ".env.test")

if (process.env.NODE_ENV === "test" && fs.existsSync(testEnv)) {
  dotenv.config({ path: testEnv })
} else if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv })
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv })
} else {
  dotenv.config()
}

export const env = {
  mongoUri: process.env.MONGODB_URI || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  port: Number(process.env.PORT || 5000),
  shiprocketEmail: process.env.SHIPROCKET_EMAIL || "",
  shiprocketPassword: process.env.SHIPROCKET_PASSWORD || "",
  shiprocketBaseUrl: process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in",
  rapidshypApiKey: process.env.RAPIDSHYP_API_KEY || "",
  rapidshypBaseUrl: process.env.RAPIDSHYP_BASE_URL || "https://api.rapidshyp.com",
  defaultShippingProvider: (process.env.DEFAULT_SHIPPING_PROVIDER || "SHIPROCKET") as "SHIPROCKET" | "RAPIDSHYP",
  publicAppUrl: process.env.PUBLIC_APP_URL || "http://localhost:3000",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
}

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is required")
}
if (!env.jwtAccessSecret) {
  throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) is required")
}
