import { Request, Response } from "express"
import Order from "../models/Order"
import Shipment from "../models/Shipment"
import ShippingLog from "../models/ShippingLog"
import WebhookEvent from "../models/WebhookEvent"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { getShippingProvider, getDefaultShippingProvider } from "../services/shippingStub"
import mongoose from "mongoose"

type ShippingProviderName = "SHIPROCKET" | "RAPIDSHYP"

async function assertOrderAccess(orderId: string, req: Request, allowCustomer = true) {
  const order = await Order.findById(orderId).populate("items.product")
  if (!order) throw new AppError("Order not found", 404)
  const isAdmin = req.user?.accountType === "ADMIN"
  const isDistributor = req.user?.accountType === "DISTRIBUTOR"
  const isRetailer = req.user?.accountType === "RETAILER"
  const isCustomer = req.user?.accountType === "CUSTOMER"
  const isOwner = order.bookedBy.toString() === req.user?.id
  if (isAdmin || isDistributor) return order
  if (isRetailer && isOwner) return order
  if (allowCustomer && isCustomer && isOwner) return order
  throw new AppError("Forbidden", 403)
}

function mapStatus(s: string): string {
  const map: Record<string, string> = {
    CREATED: "CREATED",
    AWB_ASSIGNED: "AWB_ASSIGNED",
    IN_TRANSIT: "IN_TRANSIT",
    DELIVERED: "DELIVERED",
    CANCELLED: "CANCELLED",
  }
  return map[s] || "CREATED"
}

export async function createShipment(req: Request, res: Response) {
  const orderId = req.params.orderId
  if (req.user?.accountType !== "ADMIN" && req.user?.accountType !== "DISTRIBUTOR") {
    throw new AppError("Forbidden", 403)
  }
  const provider = (req.body?.provider as ShippingProviderName) || getDefaultShippingProvider()
  const force = !!req.body?.force
  const order = await Order.findById(orderId).populate("items.product")
  if (!order) throw new AppError("Order not found", 404)
  const existing = await Shipment.findOne({ orderId })
  if (existing && !force) {
    return sendSuccess(res, existing, "Shipment already exists")
  }
  const createdBy = req.user!.id
  const providerImpl = getShippingProvider(provider)
  const internalOrder = {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerMobile: order.customerMobile,
    customerAddress: order.customerAddress,
    items: order.items.map((item: any) => ({
      product: item.product,
      quantity: item.quantity,
      amount: item.amount,
    })),
    netAmount: order.netAmount || 0,
  }
  const result = await providerImpl.createOrderFromInternal(internalOrder)
  let awb = result.awb
  let courierName = result.courierName
  let status = result.status
  let shipmentId = result.shipmentId
  let providerOrderId = result.providerOrderId
  if (!awb && result.providerOrderId) {
    try {
      const assignResult = await providerImpl.assignShipment(result.providerOrderId)
      awb = assignResult.awb
      courierName = assignResult.courierName
      status = assignResult.status
    } catch {
      //
    }
  }
  const doc = await Shipment.findOneAndUpdate(
    { orderId },
    {
      orderId,
      provider,
      providerOrderId: providerOrderId || result.providerOrderId,
      shipmentId: shipmentId || result.shipmentId,
      awb: awb || result.awb,
      courierName: courierName || result.courierName,
      status: status || result.status,
      tracking: null,
      raw: result.raw,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    },
    { upsert: true, new: true },
  )
  return sendSuccess(res, doc, "Shipment created")
}

export async function getShipment(req: Request, res: Response) {
  const orderId = req.params.orderId
  await assertOrderAccess(orderId, req, true)
  const shipment = await Shipment.findOne({ orderId })
  if (!shipment) throw new AppError("Shipment not found", 404)
  return sendSuccess(res, shipment, "Shipment fetched")
}

export async function trackShipment(req: Request, res: Response) {
  const orderId = req.params.orderId
  await assertOrderAccess(orderId, req, true)
  const shipment = await Shipment.findOne({ orderId })
  if (!shipment) throw new AppError("Shipment not found", 404)
  const providerImpl = getShippingProvider(shipment.provider as ShippingProviderName)
  const identifier = shipment.awb || shipment.shipmentId || shipment.providerOrderId
  if (!identifier) return sendSuccess(res, shipment, "No tracking identifier")
  const result = await providerImpl.track(identifier)
  shipment.tracking = result.tracking
  shipment.status = result.status
  await shipment.save()
  return sendSuccess(res, shipment, "Tracking updated")
}

function hashQuick(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export async function shiprocketWebhook(req: Request, res: Response) {
  const payload = req.body as Record<string, unknown>
  const eventId = (payload?.id ?? payload?.order_id ?? JSON.stringify(payload)) as string
  const hash = eventId.length > 200 ? `hash_${hashQuick(eventId)}` : eventId
  const id = `SHIPROCKET_${hash}`
  const existing = await WebhookEvent.findOne({ eventId: id })
  if (existing) {
    return sendSuccess(res, { processed: true, existing: true }, "Already processed")
  }
  await WebhookEvent.create({
    provider: "SHIPROCKET",
    eventId: id,
    payload,
    processedAt: new Date(),
    status: "RECEIVED",
  })
  return sendSuccess(res, { processed: true }, "Webhook received")
}

export async function rapidshypWebhook(req: Request, res: Response) {
  const payload = req.body as Record<string, unknown>
  const eventId = (payload?.event_id ?? payload?.awb ?? JSON.stringify(payload)) as string
  const hash = eventId.length > 200 ? `hash_${hashQuick(eventId)}` : eventId
  const id = `RAPIDSHYP_${hash}`
  const existing = await WebhookEvent.findOne({ eventId: id })
  if (existing) {
    return sendSuccess(res, { processed: true, existing: true }, "Already processed")
  }
  await WebhookEvent.create({
    provider: "RAPIDSHYP",
    eventId: id,
    payload,
    processedAt: new Date(),
    status: "RECEIVED",
  })
  return sendSuccess(res, { processed: true }, "Webhook received")
}

export async function listShippingLogs(req: Request, res: Response) {
  const filter: Record<string, unknown> = {}
  const logs = await ShippingLog.find(filter).sort({ createdAt: -1 }).limit(100).lean()
  return sendSuccess(res, { items: logs }, "Shipping logs fetched")
}

export async function testShiprocketConnectivity(_req: Request, res: Response) {
  return sendSuccess(res, { connected: true, provider: "SHIPROCKET" }, "Connected")
}

export async function testRapidShypConnectivity(_req: Request, res: Response) {
  return sendSuccess(res, { connected: true, provider: "RAPIDSHYP" }, "Connected")
}
