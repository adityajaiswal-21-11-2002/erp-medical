import express from "express"
import request from "supertest"
import { requireFeatureFlag } from "../middleware/featureFlag"
import featureFlagRoutes from "../routes/featureFlags"

const next = jest.fn()
const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any

const findOneMock = jest.fn()
const findOneAndUpdateMock = jest.fn().mockResolvedValue({ _id: "flag1", key: "RETURNS_ENABLED", enabled: true })
const findMock = jest.fn().mockResolvedValue([])

jest.mock("../models/FeatureFlag", () => ({
  findOne: (...args: unknown[]) => findOneMock(...args),
  findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args),
  find: (...args: unknown[]) => findMock(...args),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({
    _id: "admin1",
    status: "ACTIVE",
    role: "ADMIN",
    email: "admin@demo.com",
    name: "Admin",
  }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "ADMIN", userId: "admin1" }),
}))

jest.mock("../utils/token", () => ({
  signAccessToken: jest.fn().mockReturnValue("token"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "admin1", role: "ADMIN" }),
}))

jest.mock("../services/complianceService", () => ({
  logComplianceEvent: jest.fn().mockResolvedValue(undefined),
}))

describe("requireFeatureFlag", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("allows when flag enabled", async () => {
    findOneMock.mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true })
    const middleware = requireFeatureFlag("RETURNS_ENABLED")
    await middleware({} as any, res, next)
    expect(next).toHaveBeenCalled()
  })

  it("returns 403 when flag disabled", async () => {
    findOneMock.mockResolvedValue({ key: "RETURNS_ENABLED", enabled: false })
    const middleware = requireFeatureFlag("RETURNS_ENABLED")
    await middleware({} as any, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }))
  })
})

describe("Feature flags API", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/feature-flags", featureFlagRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    findOneMock.mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true })
    findMock.mockResolvedValue([{ key: "RETURNS_ENABLED", enabled: true }, { key: "COUPONS_ENABLED", enabled: true }])
  })

  it("admin can toggle returns flag", async () => {
    findOneAndUpdateMock.mockResolvedValue({ _id: "flag1", key: "RETURNS_ENABLED", enabled: false })

    const res = await request(app)
      .patch("/api/feature-flags/RETURNS_ENABLED")
      .set("Authorization", "Bearer token")
      .send({ enabled: false })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.enabled).toBe(false)
  })

  it("retailer endpoints enforce flag - returns blocked when disabled", async () => {
    const returnRoutes = require("../routes/returns").default
    const appReturns = express()
    appReturns.use(express.json())
    appReturns.use("/api/returns", returnRoutes)

    findOneMock.mockResolvedValue({ key: "RETURNS_ENABLED", enabled: false })
    const User = require("../models/User")
    User.findById.mockResolvedValue({
      _id: "ret1",
      status: "ACTIVE",
      role: "USER",
      email: "user@demo.com",
      name: "Retailer",
    })
    const AccountProfile = require("../models/AccountProfile")
    AccountProfile.findOne.mockResolvedValue({ accountType: "RETAILER", userId: "ret1" })
    require("../utils/token").verifyAccessToken.mockReturnValue({ userId: "ret1", role: "USER" })

    const res = await request(appReturns)
      .get("/api/returns")
      .set("Authorization", "Bearer token")

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/disabled/i)
  })
})
