import express from "express"
import request from "supertest"
import crypto from "crypto"
import paymentRoutes from "../routes/payments"
import webhookRoutes from "../routes/webhooks"

const TEST_SECRET = "razorpay_test_secret"
const TEST_WEBHOOK_SECRET = "webhook_test_secret"

jest.mock("../config/env", () => ({
  env: {
    razorpayKeyId: "rzp_test",
    razorpayKeySecret: TEST_SECRET,
    razorpayWebhookSecret: TEST_WEBHOOK_SECRET,
  },
}))

let findOrder: any
let findOnePayment: any
let findOneAndUpdatePayment: any
let findOneWebhookEvent: any
let createWebhookEvent: any
let findOneLoyalty: any
let createLoyalty: any

jest.mock("../models/Order", () => ({
  findById: jest.fn(),
}))

jest.mock("../models/Payment", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue([]) }) }) }),
}))

jest.mock("../models/WebhookEvent", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}))

jest.mock("../models/LoyaltyLedger", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({ _id: "user1", status: "ACTIVE", email: "u@u.com", name: "User" }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "CUSTOMER", userId: "user1" }),
}))

jest.mock("../utils/token", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "USER" }),
}))

jest.mock("razorpay", () => ({
  default: class {
    orders = {
      create: jest.fn().mockResolvedValue({ id: "rp_order_123" }),
    }
  },
}))

describe("Razorpay", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/payments", paymentRoutes)
  app.use("/api/webhooks", webhookRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    const Order = require("../models/Order")
    const Payment = require("../models/Payment")
    const WebhookEvent = require("../models/WebhookEvent")
    const LoyaltyLedger = require("../models/LoyaltyLedger")
    findOrder = Order.findById
    findOnePayment = Payment.findOne
    findOneAndUpdatePayment = Payment.findOneAndUpdate
    findOneWebhookEvent = WebhookEvent.findOne
    createWebhookEvent = WebhookEvent.create
    findOneLoyalty = LoyaltyLedger.findOne
    createLoyalty = LoyaltyLedger.create

    findOrder.mockResolvedValue({
      _id: "order1",
      orderNumber: "ORD-1",
      bookedBy: "user1",
      netAmount: 500,
      customerName: "C",
      populate: jest.fn().mockResolvedThis(),
    })
  })

  it("create Razorpay order endpoint returns proper payload", async () => {
    findOnePayment.mockResolvedValue(null)
    findOneAndUpdatePayment.mockResolvedValue({
      orderId: "order1",
      razorpayOrderId: "rp_order_123",
      status: "CREATED",
    })

    const res = await request(app)
      .post("/api/payments/razorpay/order")
      .set("Authorization", "Bearer token")
      .send({ orderId: "order1" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.keyId).toBeDefined()
    expect(res.body.data.razorpayOrderId).toBeDefined()
    expect(res.body.data.amount).toBe(50000)
  })

  it("verify endpoint validates signature (mock) and is idempotent when already captured", async () => {
    const orderId = "rp_order_123"
    const paymentId = "rp_pay_456"
    const sig = crypto.createHmac("sha256", TEST_SECRET).update(`${orderId}|${paymentId}`).digest("hex")

    findOnePayment
      .mockResolvedValueOnce({
        orderId: "order1",
        status: "CREATED",
        save: jest.fn().mockResolvedValue(true),
      })
      .mockResolvedValue({ orderId: "order1", status: "CAPTURED" })

    const res1 = await request(app)
      .post("/api/payments/razorpay/verify")
      .set("Authorization", "Bearer token")
      .send({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
        internalOrderId: "order1",
      })
    expect(res1.status).toBe(200)
    expect(res1.body.data.verified).toBe(true)

    const res2 = await request(app)
      .post("/api/payments/razorpay/verify")
      .set("Authorization", "Bearer token")
      .send({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
        internalOrderId: "order1",
      })
    expect(res2.status).toBe(200)
    expect(res2.body.data.alreadyCaptured).toBe(true)
  })

  it("webhook validates signature and is idempotent", async () => {
    const payload = { event: "payment.captured", payload: { payment: { entity: { id: "pay_1", order_id: "rp_ord_1" } } } }
    const rawBody = JSON.stringify(payload)
    const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex")

    findOneWebhookEvent
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ eventId: "RAZORPAY_1" })
    createWebhookEvent.mockResolvedValue({})
    findOnePayment.mockResolvedValue({
      orderId: "order1",
      razorpayOrderId: "rp_ord_1",
      status: "CREATED",
      save: jest.fn().mockResolvedValue(true),
    })
    findOrder.mockResolvedValue({ _id: "order1", bookedBy: "user1", netAmount: 500 })
    findOneLoyalty.mockResolvedValue(null)
    createLoyalty.mockResolvedValue({})

    const res1 = await request(app)
      .post("/api/webhooks/razorpay")
      .set("x-razorpay-signature", sig)
      .send(payload)
    expect(res1.status).toBe(200)
    expect(createWebhookEvent).toHaveBeenCalledTimes(1)

    const res2 = await request(app)
      .post("/api/webhooks/razorpay")
      .set("x-razorpay-signature", sig)
      .send(payload)
    expect(res2.status).toBe(200)
    expect(res2.body.data.existing).toBe(true)
  })

  it("payment.captured updates Payment status and does not double-credit loyalty", async () => {
    const payload = {
      event: "payment.captured",
      event_id: "evt_uniq_1",
      payload: { payment: { entity: { id: "pay_1", order_id: "rp_ord_1" } } },
    }
    const rawBody = JSON.stringify(payload)
    const sig = crypto.createHmac("sha256", TEST_WEBHOOK_SECRET).update(rawBody).digest("hex")

    findOneWebhookEvent.mockResolvedValue(null)
    createWebhookEvent.mockResolvedValue({})
    const paymentSave = jest.fn().mockResolvedValue(true)
    findOnePayment.mockResolvedValue({
      orderId: "order1",
      razorpayOrderId: "rp_ord_1",
      status: "CREATED",
      save: paymentSave,
    })
    findOrder.mockResolvedValue({ _id: "order1", bookedBy: "user1", netAmount: 500 })
    findOneLoyalty.mockResolvedValue(null)
    createLoyalty.mockResolvedValue({})

    await request(app).post("/api/webhooks/razorpay").set("x-razorpay-signature", sig).send(payload)
    await request(app).post("/api/webhooks/razorpay").set("x-razorpay-signature", sig).send(payload)

    expect(createLoyalty).toHaveBeenCalledTimes(1)
  })
})
