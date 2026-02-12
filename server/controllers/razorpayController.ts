import { Request, Response } from "express"
import crypto from "crypto"
import Order from "../models/Order"
import Payment from "../models/Payment"
import WebhookEvent from "../models/WebhookEvent"
import LoyaltyLedger from "../models/LoyaltyLedger"
import { env } from "../config/env"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { createShipmentForOrderIdInternal } from "./shipmentController"

const RAZORPAY_KEY_SECRET = env.razorpayKeySecret || ""
const RAZORPAY_WEBHOOK_SECRET = env.razorpayWebhookSecret || ""

/** Returns the public Razorpay key id (RAZORPAY_KEY_ID) for frontend checkout. */
export async function getRazorpayPublicKey(_req: Request, res: Response) {
  return sendSuccess(res, { keyId: env.razorpayKeyId || "" }, "OK")
}

/** Webhook is only active when a real secret is set (not empty or placeholder). */
function isWebhookConfigured(): boolean {
  const s = (RAZORPAY_WEBHOOK_SECRET || "").trim()
  if (!s) return false
  const placeholders = ["your_webhook_secret", "webhook_secret", "whsec_xxx", "replace_me"]
  if (placeholders.some((p) => s.toLowerCase() === p.toLowerCase())) return false
  return true
}

function getBookedByUserId(order: { bookedBy: unknown }): string | null {
  const b = order.bookedBy
  if (!b) return null
  const doc = b as { _id?: { toString(): string }; toString?: () => string }
  if (doc._id) return doc._id.toString()
  return typeof (b as { toString?: () => string }).toString === "function" ? (b as { toString: () => string }).toString() : String(b)
}

export async function createRazorpayOrder(req: Request, res: Response) {
  const orderId = req.body?.orderId as string
  if (!orderId) throw new AppError("orderId required", 400)
  const order = await Order.findById(orderId).populate("bookedBy", "name email")
  if (!order) throw new AppError("Order not found", 404)
  const bookedById = getBookedByUserId(order)
  const isOwner = bookedById === req.user?.id
  if (!isOwner) throw new AppError("Forbidden", 403)
  const amountPaise = Math.round((order.netAmount || 0) * 100)
  if (amountPaise < 100) throw new AppError("Amount too low", 400)
  let payment = await Payment.findOne({ orderId })
  if (payment?.razorpayOrderId && payment.status === "CREATED") {
    return sendSuccess(res, {
      keyId: env.razorpayKeyId,
      razorpayOrderId: payment.razorpayOrderId,
      amount: amountPaise,
      currency: payment.currency || "INR",
      name: (order as any).customerName || "Customer",
      description: `Order ${order.orderNumber}`,
      prefill: { email: (order.bookedBy as any)?.email || "", name: (order as any).customerName || "" },
    }, "Razorpay order already created")
  }
  if (payment?.status === "CAPTURED") {
    throw new AppError("Order already paid", 400)
  }
  if (!env.razorpayKeyId || !RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay is not configured", 503)
  }
  const Razorpay = (await import("razorpay")).default
  const instance = new Razorpay({ key_id: env.razorpayKeyId, key_secret: RAZORPAY_KEY_SECRET })
  const options = {
    amount: amountPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: order._id.toString() },
  }
  const razorpayOrder = await instance.orders.create(options)
  const razorpayOrderId = (razorpayOrder as { id: string }).id
  await Payment.findOneAndUpdate(
    { orderId },
    {
      orderId,
      provider: "RAZORPAY",
      razorpayOrderId,
      amount: order.netAmount,
      currency: "INR",
      status: "CREATED",
      raw: razorpayOrder as unknown as Record<string, unknown>,
    },
    { upsert: true, new: true },
  )
  return sendSuccess(res, {
    keyId: env.razorpayKeyId,
    razorpayOrderId,
    amount: amountPaise,
    currency: "INR",
    name: (order as any).customerName || "Customer",
    description: `Order ${order.orderNumber}`,
    prefill: { email: (order.bookedBy as any)?.email || "", name: (order as any).customerName || "" },
  }, "Razorpay order created")
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body).digest("hex")
  return expected === signature
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    internalOrderId,
  } = req.body || {}
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internalOrderId) {
    throw new AppError("Missing payment verification fields", 400)
  }
  const valid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  if (!valid) throw new AppError("Invalid signature", 400)
  const payment = await Payment.findOne({ orderId: internalOrderId })
  if (!payment) throw new AppError("Payment record not found", 404)
  if (payment.status === "CAPTURED") {
    return sendSuccess(res, { verified: true, alreadyCaptured: true }, "Already captured")
  }
  payment.razorpayPaymentId = razorpay_payment_id
  payment.signature = razorpay_signature
  payment.status = "CAPTURED"
  await payment.save()
  await creditLoyaltyOnce(internalOrderId)
  try {
    await createShipmentForOrderIdInternal(internalOrderId)
  } catch {
    // Do not fail payment verification if shipment creation fails (e.g. Shiprocket not configured)
  }
  return sendSuccess(res, { verified: true }, "Payment verified")
}

async function creditLoyaltyOnce(orderId: string): Promise<void> {
  const order = await Order.findById(orderId)
  if (!order) return
  const existing = await LoyaltyLedger.findOne({
    userId: order.bookedBy,
    source: "RAZORPAY_CAPTURE",
    "metadata.orderId": orderId,
  })
  if (existing) return
  const points = Math.max(Math.floor((order.netAmount || 0) / 100), 0)
  if (points <= 0) return
  await LoyaltyLedger.create({
    userId: order.bookedBy,
    points,
    type: "EARN",
    source: "RAZORPAY_CAPTURE",
    metadata: { orderId },
  })
}

function getRawBody(req: Request): string {
  const raw = (req as any).rawBody
  if (typeof raw === "string") return raw
  return JSON.stringify(req.body || {})
}

export async function razorpayWebhook(req: Request, res: Response) {
  if (!isWebhookConfigured()) {
    return res.status(503).json({
      success: false,
      error: "Webhook secret not configured. Add RAZORPAY_WEBHOOK_SECRET from Razorpay Dashboard when ready.",
    })
  }
  const signature = req.headers["x-razorpay-signature"] as string
  if (!signature) {
    return res.status(400).json({ success: false, error: "Missing webhook signature" })
  }
  const rawBody = getRawBody(req)
  const expected = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")
  if (expected !== signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" })
  }
  const payload = req.body as { event?: string; payload?: { payment?: { entity?: { id: string; order_id: string } }; order?: { entity?: { id: string } } } }
  const eventId = (payload as any).event_id ?? (payload as any).id ?? `rp_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const id = `RAZORPAY_${eventId}`
  const existing = await WebhookEvent.findOne({ eventId: id })
  if (existing) {
    return sendSuccess(res, { processed: true, existing: true }, "Already processed")
  }
  await WebhookEvent.create({
    provider: "RAZORPAY",
    eventId: id,
    payload: payload,
    processedAt: new Date(),
    orderId: undefined,
    status: "RECEIVED",
  })
  const event = payload?.event
  const paymentEntity = payload?.payload?.payment?.entity
  const orderEntity = payload?.payload?.order?.entity
  if (event === "payment.captured" && paymentEntity) {
    const razorpayPaymentId = paymentEntity.id
    const razorpayOrderId = paymentEntity.order_id
    const payment = await Payment.findOne({ razorpayOrderId })
    if (payment) {
      if (payment.status !== "CAPTURED") {
        payment.razorpayPaymentId = razorpayPaymentId
        payment.status = "CAPTURED"
        await payment.save()
        await creditLoyaltyOnce(payment.orderId.toString())
      }
      try {
        await createShipmentForOrderIdInternal(payment.orderId.toString())
      } catch {
        // ignore
      }
    }
  }
  if (event === "order.paid" && orderEntity) {
    const razorpayOrderId = orderEntity.id
    const payment = await Payment.findOne({ razorpayOrderId })
    if (payment && payment.status !== "CAPTURED") {
      payment.status = "CAPTURED"
      await payment.save()
      await creditLoyaltyOnce(payment.orderId.toString())
    }
    if (payment) {
      try {
        await createShipmentForOrderIdInternal(payment.orderId.toString())
      } catch {
        // ignore
      }
    }
  }
  return sendSuccess(res, { processed: true }, "Webhook received")
}

export async function listRazorpayPayments(_req: Request, res: Response) {
  const payments = await Payment.find().sort({ createdAt: -1 }).limit(200).populate("orderId", "orderNumber netAmount").lean()
  return sendSuccess(res, { items: payments }, "Razorpay payments fetched")
}

export async function listWebhookEvents(req: Request, res: Response) {
  const provider = String(req.query.provider || "").trim()
  const filter = provider ? { provider } : {}
  const events = await WebhookEvent.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  return sendSuccess(res, { items: events }, "Webhook events fetched")
}
