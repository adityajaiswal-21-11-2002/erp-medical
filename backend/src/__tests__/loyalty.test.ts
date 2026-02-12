import express from "express"
import request from "supertest"
import loyaltyRoutes from "../routes/loyalty"

let ledgerData: Array<{ userId: string; points: number; type: string }> = []
const ledgerCreateMock = jest.fn()

jest.mock("../models/LoyaltyLedger", () => ({
  find: jest.fn().mockReturnValue({
    sort: jest.fn().mockImplementation(() => Promise.resolve(ledgerData)),
  }),
  create: (...args: unknown[]) => ledgerCreateMock(...args),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({ _id: "user1", status: "ACTIVE", email: "u@u.com", name: "User" }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "RETAILER", userId: "user1" }),
}))

jest.mock("../utils/token", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "USER" }),
}))

describe("Loyalty", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/loyalty", loyaltyRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    ledgerData = [
      { userId: "user1", points: 50, type: "EARN" },
      { userId: "user1", points: 20, type: "EARN" },
    ]
    ledgerCreateMock.mockResolvedValue({ _id: "entry1", points: 10, type: "REDEEM" })
  })

  it("get summary returns points balance", async () => {
    const res = await request(app)
      .get("/api/loyalty/summary")
      .set("Authorization", "Bearer token")
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.points).toBe(70)
  })

  it("earn points creates ledger entry", async () => {
    const res = await request(app)
      .post("/api/loyalty/earn")
      .set("Authorization", "Bearer token")
      .send({ points: 100, source: "ORDER" })
    expect(res.status).toBe(200)
    expect(ledgerCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user1", points: 100, type: "EARN", source: "ORDER" }),
    )
  })

  it("redeem within balance succeeds", async () => {
    const res = await request(app)
      .post("/api/loyalty/redeem")
      .set("Authorization", "Bearer token")
      .send({ points: 30 })
    expect(res.status).toBe(200)
    expect(ledgerCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user1", points: 30, type: "REDEEM" }),
    )
  })

  it("redeem more than balance fails with 400", async () => {
    const res = await request(app)
      .post("/api/loyalty/redeem")
      .set("Authorization", "Bearer token")
      .send({ points: 200 })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Insufficient points/i)
    expect(ledgerCreateMock).not.toHaveBeenCalled()
  })

  it("redeem zero or negative points fails", async () => {
    const res = await request(app)
      .post("/api/loyalty/redeem")
      .set("Authorization", "Bearer token")
      .send({ points: 0 })
    expect(res.status).toBe(400)
    expect(ledgerCreateMock).not.toHaveBeenCalled()
  })
})
