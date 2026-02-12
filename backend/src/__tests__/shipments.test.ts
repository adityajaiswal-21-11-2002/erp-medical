import express from "express"
import request from "supertest"
import shipmentRoutes from "../routes/shipments"
import webhookRoutes from "../routes/webhooks"

const mockOrder = {
  _id: "order1",
  orderNumber: "ORD-001",
  bookedBy: "user1",
  customerName: "Test",
  customerMobile: "9999999999",
  customerAddress: "Addr",
  items: [{ product: "p1", quantity: 1, amount: 100 }],
  netAmount: 100,
  populate: jest.fn().mockResolvedThis(),
}

const mockShipment = {
  _id: "ship1",
  orderId: "order1",
  provider: "SHIPROCKET",
  awb: "AWB123",
  courierName: "Courier",
  status: "AWB_ASSIGNED",
}

let findOneShipment: any
let findOneAndUpdateShipment: any
let findOrder: any
let createWebhookEvent: any
let findOneWebhookEvent: any

jest.mock("../models/Order", () => ({
  findById: jest.fn(),
}))

jest.mock("../models/Shipment", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }),
}))

jest.mock("../models/ShippingLog", () => ({
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }),
}))

jest.mock("../models/WebhookEvent", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({ _id: "user1", status: "ACTIVE", role: "ADMIN", email: "a@b.com", name: "Admin" }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "DISTRIBUTOR", userId: "user1" }),
}))

jest.mock("../utils/token", () => ({
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "ADMIN" }),
}))

describe("Shipments", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/shipments", shipmentRoutes)
  app.use("/api/webhooks", webhookRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    const Order = require("../models/Order")
    const Shipment = require("../models/Shipment")
    const WebhookEvent = require("../models/WebhookEvent")
    findOrder = Order.findById
    findOneShipment = Shipment.findOne
    findOneAndUpdateShipment = Shipment.findOneAndUpdate
    findOneWebhookEvent = WebhookEvent.findOne
    createWebhookEvent = WebhookEvent.create
    findOrder.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockOrder) })
  })

  it("create shipment idempotency: calling create twice returns same Shipment", async () => {
    findOneShipment
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockShipment)
      .mockResolvedValue(mockShipment)
    findOneAndUpdateShipment.mockResolvedValue(mockShipment)

    const res1 = await request(app)
      .post("/api/shipments/order1/create")
      .set("Authorization", "Bearer token")
      .send({})
    expect(res1.status).toBe(200)
    expect(res1.body.success).toBe(true)
    expect(res1.body.data.awb).toBe("AWB123")

    const res2 = await request(app)
      .post("/api/shipments/order1/create")
      .set("Authorization", "Bearer token")
      .send({})
    expect(res2.status).toBe(200)
    expect(res2.body.message).toMatch(/already exists/i)
    expect(res2.body.data._id).toBe(mockShipment._id)
  })

  it("track updates status", async () => {
    const ship = { ...mockShipment, save: jest.fn().mockResolvedValue(true) }
    findOneShipment.mockResolvedValue(ship)

    const res = await request(app)
      .post("/api/shipments/order1/track")
      .set("Authorization", "Bearer token")
    expect(res.status).toBe(200)
    expect(ship.save).toHaveBeenCalled()
  })

  it("webhook event stored idempotently", async () => {
    findOneWebhookEvent
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ eventId: "RAPIDSHYP_abc" })
    createWebhookEvent.mockResolvedValue({})

    await request(app).post("/api/webhooks/rapidshyp").send({ awb: "AWB1", event_id: "abc" })
    await request(app).post("/api/webhooks/rapidshyp").send({ awb: "AWB1", event_id: "abc" })

    expect(createWebhookEvent).toHaveBeenCalledTimes(1)
  })
})
