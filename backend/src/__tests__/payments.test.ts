import express from "express"
import request from "supertest"
import paymentRoutes from "../routes/payments"

const createMock = jest.fn().mockResolvedValue({
  _id: "pi1",
  orderId: "order1",
  amount: 100,
  token: "tok_abc123",
  status: "PENDING",
})
const findOneAndUpdateMock = jest.fn().mockResolvedValue({
  _id: "pi1",
  token: "tok_abc123",
  status: "SUCCESS",
})
const findMock = jest.fn().mockResolvedValue([])

jest.mock("../models/PaymentIntent", () => ({
  create: (...args: unknown[]) => createMock(...args),
  findOneAndUpdate: (...args: unknown[]) => findOneAndUpdateMock(...args),
  find: (...args: unknown[]) => findMock(...args),
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

jest.mock("../services/complianceService", () => ({
  logComplianceEvent: jest.fn().mockResolvedValue(undefined),
}))

describe("Payments (stub)", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/payments", paymentRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    createMock.mockResolvedValue({
      _id: "pi1",
      orderId: "order1",
      amount: 100,
      token: "tok_abc123",
      status: "PENDING",
    })
    findOneAndUpdateMock.mockResolvedValue({
      _id: "pi1",
      token: "tok_abc123",
      status: "SUCCESS",
    })
  })

  it("payment intent created returns tokenized intent", async () => {
    const res = await request(app)
      .post("/api/payments/intent")
      .set("Authorization", "Bearer token")
      .send({ orderId: "order1", amount: 100 })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.token).toMatch(/^tok_|^tok_/)
    expect(createMock).toHaveBeenCalled()
  })

  it("webhook updates payment status", async () => {
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Authorization", "Bearer token")
      .send({ token: "tok_abc123", status: "SUCCESS" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe("SUCCESS")
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { token: "tok_abc123" },
      { status: "SUCCESS" },
      expect.any(Object),
    )
  })

  it("idempotency: duplicate webhook does not double-credit (same status)", async () => {
    findOneAndUpdateMock.mockResolvedValue({
      _id: "pi1",
      token: "tok_abc123",
      status: "SUCCESS",
    })

    await request(app)
      .post("/api/payments/webhook")
      .set("Authorization", "Bearer token")
      .send({ token: "tok_abc123", status: "SUCCESS" })
    await request(app)
      .post("/api/payments/webhook")
      .set("Authorization", "Bearer token")
      .send({ token: "tok_abc123", status: "SUCCESS" })

    expect(findOneAndUpdateMock).toHaveBeenCalledTimes(2)
  })
})
