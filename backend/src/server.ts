import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import { connectDb } from "./config/db"
import { env } from "./config/env"
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import productRoutes from "./routes/products"
import orderRoutes from "./routes/orders"
import accountRoutes from "./routes/account"
import kycRoutes from "./routes/kyc"
import featureFlagRoutes from "./routes/featureFlags"
import loyaltyRoutes from "./routes/loyalty"
import rewardRoutes from "./routes/rewards"
import referralRoutes from "./routes/referrals"
import analyticsRoutes from "./routes/analytics"
import erpRoutes from "./routes/erp"
import syncRoutes from "./routes/sync"
import complianceRoutes from "./routes/compliance"
import ticketRoutes from "./routes/tickets"
import bannerRoutes from "./routes/banners"
import paymentRoutes from "./routes/payments"
import returnRoutes from "./routes/returns"
import couponRoutes from "./routes/coupons"
import distributorRoutes from "./routes/distributor"
import { errorHandler } from "./middleware/error"
import { swaggerSpec } from "./swagger"
import { sendSuccess } from "./utils/response"

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
  }),
)

function getDbStatus() {
  const state = mongoose.connection.readyState
  if (state === 1) return "connected"
  if (state === 2) return "connecting"
  if (state === 3) return "disconnecting"
  return "disconnected"
}

app.get("/api/health", (_req, res) =>
  sendSuccess(res, { status: "ok", db: getDbStatus() }, "Healthy"),
)
app.get("/health", (_req, res) =>
  sendSuccess(res, { status: "ok", db: getDbStatus() }, "Healthy"),
)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/account", accountRoutes)
app.use("/api/kyc", kycRoutes)
app.use("/api/feature-flags", featureFlagRoutes)
app.use("/api/loyalty", loyaltyRoutes)
app.use("/api/rewards", rewardRoutes)
app.use("/api/referrals", referralRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/erp", erpRoutes)
app.use("/api/sync", syncRoutes)
app.use("/api/compliance", complianceRoutes)
app.use("/api/tickets", ticketRoutes)
app.use("/api/banners", bannerRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/returns", returnRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/distributor", distributorRoutes)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(errorHandler)

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API running on port ${env.port}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err)
    process.exit(1)
  })
