import mongoose from "mongoose"
import Order from "../models/Order"
import Product from "../models/Product"
import { AppError } from "../middleware/error"
import { generateOrderNumber } from "../utils/orderNumber"

type OrderItemInput = {
  product: string
  batch?: string
  expiry?: string
  quantity: number
  freeQuantity?: number
  mrp?: number
  rate?: number
  discount?: number
  cgst?: number
  sgst?: number
  amount?: number
}

type CreateOrderInput = {
  userId: string
  customerName: string
  customerMobile: string
  customerAddress: string
  gstin?: string
  doctorName?: string
  items: OrderItemInput[]
}

type CreatedOrderDoc = mongoose.Document & { _id: mongoose.Types.ObjectId; netAmount?: number }

function isTransactionNotSupportedError(err: unknown): boolean {
  const msg = err && typeof err === "object" && "message" in err ? String((err as { message?: string }).message) : ""
  return /transaction|replica set|mongos/i.test(msg)
}

export async function createOrder(input: CreateOrderInput): Promise<CreatedOrderDoc | null> {
  const runWithSession = async (session: mongoose.mongo.ClientSession | null) => {
    const sessionOpt = session ? { session } : undefined
    let orderNumber = generateOrderNumber()
    let collision = session ? await Order.exists({ orderNumber }).session(session) : await Order.exists({ orderNumber })
    let attempts = 0
    while (collision && attempts < 5) {
      orderNumber = generateOrderNumber()
      collision = session ? await Order.exists({ orderNumber }).session(session) : await Order.exists({ orderNumber })
      attempts += 1
    }
    if (collision) {
      throw new AppError("Could not generate order number", 500)
    }

    let subtotal = 0
    let totalDiscount = 0
    let totalGst = 0

    const orderItems: {
      product: mongoose.Types.ObjectId
      batch?: string
      expiry?: string
      quantity: number
      freeQuantity?: number
      mrp?: number
      rate?: number
      discount?: number
      cgst?: number
      sgst?: number
      amount?: number
    }[] = []
    for (const item of input.items) {
      const product = session
        ? await Product.findById(item.product).session(session)
        : await Product.findById(item.product)
      if (!product) {
        throw new AppError("Product not found", 404)
      }
      if (product.currentStock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400)
      }

      const rate = item.rate ?? product.ptr ?? product.mrp
      const mrp = item.mrp ?? product.mrp
      const lineBase = rate * item.quantity
      const lineDiscount = item.discount ?? 0
      const taxable = Math.max(lineBase - lineDiscount, 0)
      const gstRate = (product.gstPercent ?? 0) / 100
      const gstAmount = taxable * gstRate
      const cgst = item.cgst ?? gstAmount / 2
      const sgst = item.sgst ?? gstAmount / 2
      const amount = item.amount ?? taxable + cgst + sgst

      subtotal += lineBase
      totalDiscount += lineDiscount
      totalGst += cgst + sgst

      product.currentStock -= item.quantity
      await product.save(sessionOpt)

      orderItems.push({
        product: product._id,
        batch: item.batch,
        expiry: item.expiry,
        quantity: item.quantity,
        freeQuantity: item.freeQuantity ?? 0,
        mrp,
        rate,
        discount: lineDiscount,
        cgst,
        sgst,
        amount,
      })
    }

    const netAmount = Math.max(subtotal - totalDiscount + totalGst, 0)
    const created = await Order.create(
      [
        {
          orderNumber,
          bookedBy: input.userId,
          customerName: input.customerName,
          customerMobile: input.customerMobile,
          customerAddress: input.customerAddress,
          gstin: input.gstin,
          doctorName: input.doctorName,
          items: orderItems,
          subtotal,
          totalDiscount,
          totalGst,
          netAmount,
          status: "PLACED",
        },
      ],
      sessionOpt as mongoose.SaveOptions,
    )
    return created[0] as CreatedOrderDoc
  }

  try {
    const session = await mongoose.startSession()
    let createdOrder: CreatedOrderDoc | null = null
    await session.withTransaction(async () => {
      createdOrder = await runWithSession(session)
    })
    session.endSession()
    return createdOrder
  } catch (err) {
    if (isTransactionNotSupportedError(err)) {
      return runWithSession(null)
    }
    throw err
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const runWithSession = async (session: mongoose.mongo.ClientSession | null) => {
    const sessionOpt = session ? { session } : undefined
    const order = session
      ? await Order.findById(orderId).session(session)
      : await Order.findById(orderId)
    if (!order) {
      throw new AppError("Order not found", 404)
    }
    if (order.status === status) {
      return order
    }
    if (status === "CANCELLED") {
      if (order.status !== "PLACED") {
        throw new AppError("Only placed orders can be cancelled", 400)
      }
      for (const item of order.items) {
        const product = session
          ? await Product.findById(item.product).session(session)
          : await Product.findById(item.product)
        if (product) {
          product.currentStock += item.quantity
          await product.save(sessionOpt)
        }
      }
    }
    order.status = status as "PLACED" | "CANCELLED" | "DELIVERED"
    return order.save(sessionOpt)
  }

  try {
    const session = await mongoose.startSession()
    let updatedOrder: mongoose.Document | null = null
    await session.withTransaction(async () => {
      updatedOrder = await runWithSession(session)
    })
    session.endSession()
    return updatedOrder
  } catch (err) {
    if (isTransactionNotSupportedError(err)) {
      return runWithSession(null)
    }
    throw err
  }
}
