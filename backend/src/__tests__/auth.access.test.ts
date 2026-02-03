import express from "express"
import request from "supertest"
import authRoutes from "../routes/auth"
import featureFlagRoutes from "../routes/featureFlags"
import { errorHandler } from "../middleware/error"
import { signAccessToken } from "../utils/token"

const adminId = "507f1f77bcf86cd799439011"
const retailerId = "507f1f77bcf86cd799439012"
const distributorId = "507f1f77bcf86cd799439013"
const customerId = "507f1f77bcf86cd799439014"

function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    _id: adminId,
    name: "Admin",
    email: "admin@demo.com",
    status: "ACTIVE",
    role: "ADMIN",
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  }
}

function mockProfile(accountType: string) {
  return { accountType, kycStatus: "APPROVED", userId: adminId }
}

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn().mockResolvedValue(1),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({}),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
}))

jest.mock("../models/FeatureFlag", () => ({
  findOne: jest.fn().mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true }),
  findOneAndUpdate: jest.fn().mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true }),
  find: jest.fn().mockResolvedValue([]),
}))

jest.mock("../services/complianceService", () => ({
  logComplianceEvent: jest.fn().mockResolvedValue(undefined),
}))

const User = require("../models/User")
const AccountProfile = require("../models/AccountProfile")

describe("Auth & Access Control", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/auth", authRoutes)
  app.use("/api/feature-flags", featureFlagRoutes)
  app.use(errorHandler)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("login works for each role", () => {
    it("admin can login", async () => {
      User.findOne.mockResolvedValue(mockUser({ _id: adminId, role: "ADMIN" }))
      AccountProfile.findOne.mockResolvedValue(mockProfile("ADMIN"))

      const res = await request(app).post("/api/auth/login").send({
        email: "admin@demo.com",
        password: "Admin@123",
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.user.accountType).toBe("ADMIN")
    })

    it("retailer can login", async () => {
      User.findOne.mockResolvedValue(mockUser({ _id: retailerId, role: "USER", email: "user@demo.com" }))
      AccountProfile.findOne.mockResolvedValue({ accountType: "RETAILER", kycStatus: "PENDING", userId: retailerId })

      const res = await request(app).post("/api/auth/login").send({
        email: "user@demo.com",
        password: "User@123",
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.accountType).toBe("RETAILER")
    })

    it("distributor can login", async () => {
      User.findOne.mockResolvedValue(mockUser({ _id: distributorId, role: "USER", email: "distributor@demo.com" }))
      AccountProfile.findOne.mockResolvedValue({ accountType: "DISTRIBUTOR", kycStatus: "APPROVED", userId: distributorId })

      const res = await request(app).post("/api/auth/login").send({
        email: "distributor@demo.com",
        password: "Distributor@123",
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.accountType).toBe("DISTRIBUTOR")
    })

    it("customer can login", async () => {
      User.findOne.mockResolvedValue(mockUser({ _id: customerId, role: "USER", email: "customer@demo.com" }))
      AccountProfile.findOne.mockResolvedValue({ accountType: "CUSTOMER", kycStatus: "NOT_STARTED", userId: customerId })

      const res = await request(app).post("/api/auth/login").send({
        email: "customer@demo.com",
        password: "Customer@123",
      })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.user.accountType).toBe("CUSTOMER")
    })
  })

  describe("blocked user cannot login", () => {
    it("returns 403 when user is blocked", async () => {
      const authController = require("../controllers/authController")
      User.findOne.mockResolvedValue(mockUser({ status: "BLOCKED" }))

      const req = {
        body: { email: "admin@demo.com", password: "Admin@123" },
      } as any
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any

      await expect(authController.login(req, res)).rejects.toMatchObject({
        message: "User is blocked",
        status: 403,
      })
      expect(res.status).not.toHaveBeenCalledWith(200)
    })
  })

  describe("role-based authorization rejects wrong panel API access", () => {
    it("retailer cannot PATCH feature flag (admin only)", async () => {
      const retailerUser = {
        _id: retailerId,
        name: "Retailer",
        email: "user@demo.com",
        status: "ACTIVE",
        role: "USER",
      }
      User.findById.mockResolvedValue(retailerUser)
      AccountProfile.findOne.mockResolvedValue({ accountType: "RETAILER", userId: retailerId })

      const token = signAccessToken({ userId: retailerId, role: "USER" })
      const res = await request(app)
        .patch("/api/feature-flags/RETURNS_ENABLED")
        .set("Authorization", `Bearer ${token}`)
        .send({ enabled: true })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })
  })
})
