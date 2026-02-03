import express from "express"
import request from "supertest"
import analyticsRoutes from "../routes/analytics"

const createMock = jest.fn().mockResolvedValue({
  _id: "ev1",
  eventType: "page_view",
  metadata: {},
})
const aggregateMock = jest.fn().mockResolvedValue([
  { _id: "page_view", count: 5 },
  { _id: "search", count: 2 },
])

jest.mock("../models/AnalyticsEvent", () => ({
  create: (...args: unknown[]) => createMock(...args),
  aggregate: (...args: unknown[]) => aggregateMock(...args),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({
    _id: "user1",
    status: "ACTIVE",
    role: "USER",
    email: "user@demo.com",
    name: "User",
  }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "RETAILER", userId: "user1" }),
}))

jest.mock("../utils/token", () => ({
  signAccessToken: jest.fn().mockReturnValue("token"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "USER" }),
}))

const User = require("../models/User")
const AccountProfile = require("../models/AccountProfile")

describe("Analytics", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/analytics", analyticsRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    createMock.mockResolvedValue({ _id: "ev1", eventType: "page_view", metadata: {} })
    aggregateMock.mockResolvedValue([
      { _id: "page_view", count: 5 },
      { _id: "search", count: 2 },
    ])
  })

  it("event ingestion endpoint stores events", async () => {
    const res = await request(app)
      .post("/api/analytics/events")
      .set("Authorization", "Bearer token")
      .send({ eventType: "page_view", metadata: { path: "/catalog" } })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "page_view", metadata: { path: "/catalog" } }),
    )
  })

  it("admin aggregate endpoint returns expected metrics", async () => {
    User.findById.mockResolvedValue({
      _id: "admin1",
      status: "ACTIVE",
      role: "ADMIN",
      email: "admin@demo.com",
      name: "Admin",
    })
    AccountProfile.findOne.mockResolvedValue({ accountType: "ADMIN", userId: "admin1" })
    require("../utils/token").verifyAccessToken.mockReturnValue({ userId: "admin1", role: "ADMIN" })

    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer token")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.totals).toBeDefined()
    expect(aggregateMock).toHaveBeenCalled()
  })
})
