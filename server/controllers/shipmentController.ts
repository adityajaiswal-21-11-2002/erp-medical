import { Request, Response } from "express"
import Order from "../models/Order"
import Shipment from "../models/Shipment"
import ShippingLog from "../models/ShippingLog"
import WebhookEvent from "../models/WebhookEvent"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { getShippingProvider, getDefaultShippingProvider } from "../services/shipping"
import type { ShippingProviderName } from "../services/shipping/types"
import mongoose from "mongoose"

/**
 * Create shipment for an order (used after payment success). Does not require req/user.
 * Fails silently so payment verification is not blocked (e.g. if Shiprocket is not configured).
 */
export async function createShipmentForOrderIdInternal(
  orderId: string,
  options?: { provider?: ShippingProviderName; createdBy?: string; force?: boolean }
): Promise<{ ok: boolean; shipment?: mongoose.Document; error?: string }> {
  try {
    const order = await Order.findById(orderId).populate("items.product")
    if (!order) return { ok: false, error: "Order not found" }
    const existing = await Shipment.findOne({ orderId })
    if (existing && !options?.force) return { ok: true, shipment: existing }
    const provider = options?.provider ?? getDefaultShippingProvider()
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
        // keep create result
      }
    }
    const createdBy = options?.createdBy ? new mongoose.Types.ObjectId(options.createdBy) : undefined
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
        ...(createdBy && { createdBy }),
      },
      { upsert: true, new: true },
    )
    return { ok: true, shipment: doc }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return { ok: false, error }
  }
}

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

export async function createShipment(req: Request, res: Response) {
  const orderId = req.params.orderId
  const accountType = req.user?.accountType
  if (accountType !== "ADMIN" && accountType !== "DISTRIBUTOR") {
    throw new AppError("Forbidden", 403)
  }
  const provider = (req.body?.provider as ShippingProviderName) || getDefaultShippingProvider()
  const force = !!req.body?.force
  const result = await createShipmentForOrderIdInternal(orderId, {
    provider,
    createdBy: req.user!.id,
    force,
  })
  if (!result.ok) {
    throw new AppError(result.error || "Failed to create shipment", 400)
  }
  return sendSuccess(res, result.shipment, "Shipment created")
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
  if (result.raw) shipment.raw = { ...(shipment.raw as object || {}), track: result.raw }
  await shipment.save()
  return sendSuccess(res, shipment, "Tracking updated")
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
    payload: payload,
    processedAt: new Date(),
    status: "RECEIVED",
  })
  const orderId = payload?.order_id ?? (payload as any)?.orderId
  const awb = (payload as any)?.awb ?? (payload as any)?.tracking_data?.awb
  const status = (payload as any)?.status ?? (payload as any)?.shipment_status
  if (orderId || awb) {
    const filter: Record<string, unknown> = {}
    if (awb) filter.awb = awb
    else filter.providerOrderId = String(orderId)
    const shipment = await Shipment.findOne(filter)
    if (shipment && status) {
      const { mapProviderStatusToInternal } = await import("../services/shipping")
      shipment.status = mapProviderStatusToInternal(String(status))
      if (payload) shipment.raw = { ...(shipment.raw as object || {}), webhook: payload }
      await shipment.save()
    }
  }
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
    payload: payload,
    processedAt: new Date(),
    status: "RECEIVED",
  })
  const awb = (payload as any)?.awb
  const status = (payload as any)?.status
  if (awb) {
    const shipment = await Shipment.findOne({ awb, provider: "RAPIDSHYP" })
    if (shipment && status) {
      const { mapProviderStatusToInternal } = await import("../services/shipping")
      shipment.status = mapProviderStatusToInternal(String(status))
      if (payload) shipment.raw = { ...(shipment.raw as object || {}), webhook: payload }
      await shipment.save()
    }
  }
  return sendSuccess(res, { processed: true }, "Webhook received")
}

function hashQuick(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h).toString(36)
}

export async function listShippingLogs(req: Request, res: Response) {
  const provider = String(req.query.provider || "").trim()
  const action = String(req.query.action || "").trim()
  const statusCode = req.query.statusCode ? Number(req.query.statusCode) : null
  const filter: Record<string, unknown> = {}
  if (provider) filter.provider = provider
  if (action) filter.action = action
  if (statusCode != null) filter.statusCode = statusCode
  const logs = await ShippingLog.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
  return sendSuccess(res, { items: logs }, "Shipping logs fetched")
}

export async function testShiprocketConnectivity(_req: Request, res: Response) {
  try {
    const { getShippingProvider } = await import("../services/shipping")
    const p = getShippingProvider("SHIPROCKET")
    await p.auth()
    return sendSuccess(res, { connected: true, provider: "SHIPROCKET" }, "Connected")
  } catch (e) {
    return sendSuccess(
      res,
      { connected: false, provider: "SHIPROCKET", error: e instanceof Error ? e.message : String(e) },
      "Connection failed",
    )
  }
}

export async function testRapidShypConnectivity(_req: Request, res: Response) {
  try {
    const { getShippingProvider } = await import("../services/shipping")
    const p = getShippingProvider("RAPIDSHYP")
    await p.auth()
    return sendSuccess(res, { connected: true, provider: "RAPIDSHYP" }, "Connected")
  } catch (e) {
    return sendSuccess(
      res,
      { connected: false, provider: "RAPIDSHYP", error: e instanceof Error ? e.message : String(e) },
      "Connection failed",
    )
  }
}
