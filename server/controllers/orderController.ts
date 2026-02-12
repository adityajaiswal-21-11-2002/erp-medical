import { Request, Response } from "express"
import Order from "../models/Order"
import { AppError } from "../middleware/error"
import { sendSuccess } from "../utils/response"
import { getPagination } from "../utils/pagination"
import { createOrder, updateOrderStatus } from "../services/orderService"
import Referral from "../models/Referral"
import ReferralAttribution from "../models/ReferralAttribution"
import AnalyticsEvent from "../models/AnalyticsEvent"

export async function listOrders(req: Request, res: Response) {
  const { page, limit, skip } = getPagination(req.query)
  const status = String(req.query.status || "").trim()
  const customerName = String(req.query.customerName || "").trim()
  const orderNumber = String(req.query.orderNumber || "").trim()
  const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : null
  const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : null

  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (customerName) filter.customerName = new RegExp(customerName, "i")
  if (orderNumber) filter.orderNumber = orderNumber
  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) (filter.createdAt as Record<string, unknown>).$gte = dateFrom
    if (dateTo) (filter.createdAt as Record<string, unknown>).$lte = dateTo
  }
  if (req.user?.role !== "ADMIN") {
    filter.bookedBy = req.user?.id
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("bookedBy", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ])
  return sendSuccess(res, { items, total, page, limit }, "Orders fetched")
}

function getBookedByUserId(order: { bookedBy: unknown }): string | null {
  const b = order.bookedBy
  if (!b) return null
  const doc = b as { _id?: { toString(): string } }
  if (doc._id) return doc._id.toString()
  return typeof (b as { toString?: () => string }).toString === "function" ? (b as { toString: () => string }).toString() : String(b)
}

export async function getOrder(req: Request, res: Response) {
  const order = await Order.findById(req.params.id)
    .populate("bookedBy", "name email")
    .populate("items.product")
  if (!order) {
    throw new AppError("Order not found", 404)
  }
  const bookedById = getBookedByUserId(order)
  if (req.user?.role !== "ADMIN" && bookedById !== req.user?.id) {
    throw new AppError("Forbidden", 403)
  }
  return sendSuccess(res, order, "Order fetched")
}

export async function createOrderHandler(req: Request, res: Response) {
  const order = await createOrder({
    userId: req.user!.id,
    customerName: req.body.customerName,
    customerMobile: req.body.customerMobile,
    customerAddress: req.body.customerAddress,
    gstin: req.body.gstin,
    doctorName: req.body.doctorName,
    items: req.body.items,
  })
  if (req.body.referralCode && order) {
    const referral = await Referral.findOne({ refCode: req.body.referralCode })
    if (referral) {
      const existing = await ReferralAttribution.findOne({ orderId: order._id })
      if (!existing) {
        await ReferralAttribution.create({
          refCode: referral.refCode,
          retailerId: referral.retailerId,
          customerId: req.user?.id,
          orderId: order._id,
        })
        referral.attributedOrders += 1
        await referral.save()
      }
    }
  }
  if (order) {
    await AnalyticsEvent.create({
      userId: req.user?.id,
      accountType: req.user?.accountType,
      eventType: "order_placed",
      metadata: { orderId: order._id, netAmount: order.netAmount },
    })
    // Loyalty points credited only on payment success (Razorpay verify/webhook), not on order placement
  }
  return sendSuccess(res, order, "Order created")
}

export async function setOrderStatus(req: Request, res: Response) {
  const { status } = req.body
  const order = await updateOrderStatus(req.params.id, status)
  return sendSuccess(res, order, "Order status updated")
}

export async function setInvoiceNumber(req: Request, res: Response) {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { invoiceNumber: req.body.invoiceNumber },
    { new: true },
  )
  if (!order) {
    throw new AppError("Order not found", 404)
  }
  return sendSuccess(res, order, "Invoice updated")
}
