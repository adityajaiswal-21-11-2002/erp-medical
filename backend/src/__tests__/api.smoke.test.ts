import express from "express"
import request from "supertest"
import authRoutes from "../routes/auth"
import productRoutes from "../routes/products"
import orderRoutes from "../routes/orders"
import kycRoutes from "../routes/kyc"

jest.mock("../models/User", () => ({
  countDocuments: jest.fn().mockResolvedValue(0),
  create: jest.fn().mockResolvedValue({
    _id: "user1",
    name: "Admin",
    email: "admin@demo.com",
    role: "ADMIN",
  }),
  findOne: jest.fn().mockResolvedValue({
    _id: "user1",
    name: "Admin",
    email: "admin@demo.com",
    status: "ACTIVE",
    role: "ADMIN",
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
  }),
  findById: jest.fn().mockResolvedValue({
    _id: "user1",
    name: "Admin",
    email: "admin@demo.com",
    status: "ACTIVE",
    role: "ADMIN",
  }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "ADMIN", kycStatus: "APPROVED" }),
  create: jest.fn().mockResolvedValue({ accountType: "ADMIN" }),
  findOneAndUpdate: jest.fn().mockResolvedValue({ accountType: "ADMIN" }),
}))

jest.mock("../models/Product", () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([]),
  }),
  countDocuments: jest.fn().mockResolvedValue(0),
}))

jest.mock("../services/orderService", () => ({
  createOrder: jest.fn().mockResolvedValue({ _id: "order1" }),
  updateOrderStatus: jest.fn().mockResolvedValue({ _id: "order1" }),
}))

jest.mock("../models/KycSubmission", () => ({
  create: jest.fn().mockResolvedValue({ _id: "kyc1", status: "PENDING" }),
  findOne: jest.fn().mockResolvedValue(null),
  find: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
}))

jest.mock("../services/complianceService", () => ({
  logComplianceEvent: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("../models/AnalyticsEvent", () => ({
  create: jest.fn().mockResolvedValue({ _id: "ev1" }),
}))

jest.mock("../models/LoyaltyLedger", () => ({
  create: jest.fn().mockResolvedValue({ _id: "ledger1" }),
}))

jest.mock("../models/Referral", () => ({
  findOne: jest.fn().mockResolvedValue(null),
}))

jest.mock("../models/ReferralAttribution", () => ({
  create: jest.fn().mockResolvedValue({ _id: "attr1" }),
}))

jest.mock("../middleware/auth", () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "user1", role: "ADMIN", email: "admin@demo.com", name: "Admin", status: "ACTIVE", accountType: "ADMIN" }
    next()
  },
  optionalAuth: (req: any, _res: any, next: any) => {
    req.user = { id: "user1", role: "ADMIN", email: "admin@demo.com", name: "Admin", status: "ACTIVE", accountType: "ADMIN" }
    next()
  },
}))

jest.mock("../utils/token", () => ({
  signAccessToken: jest.fn().mockReturnValue("token"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "ADMIN" }),
}))

describe("API smoke tests", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/auth", authRoutes)
  app.use("/api/products", productRoutes)
  app.use("/api/orders", orderRoutes)
  app.use("/api/kyc", kycRoutes)

  it("registers a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@demo.com",
      password: "Admin@123",
      mobile: "9999999999",
      role: "ADMIN",
    })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("lists products", async () => {
    const res = await request(app).get("/api/products")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("creates an order", async () => {
    const res = await request(app).post("/api/orders").send({
      customerName: "Test Customer",
      customerMobile: "9999999999",
      customerAddress: "Test Address",
      items: [{ product: "prod1", quantity: 1 }],
    })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it("submits KYC", async () => {
    const res = await request(app).post("/api/kyc/submit").send({
      businessName: "Test Pharmacy",
    })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
