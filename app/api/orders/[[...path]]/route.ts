import { runHandler } from "@/server/next-adapter"
import {
  createOrderHandler,
  getOrder,
  listOrders,
  setInvoiceNumber,
  setOrderStatus,
} from "@/server/controllers/orderController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { requireAccountType } from "@/server/middleware/accountType"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    customerName: z.string().min(1),
    customerMobile: z.string().min(6),
    customerAddress: z.string().min(3),
    gstin: z.string().optional(),
    doctorName: z.string().optional(),
    referralCode: z.string().optional(),
    items: z
      .array(
        z.object({
          product: z.string().min(1),
          batch: z.string().optional(),
          expiry: z.string().optional(),
          quantity: z.number().min(1),
          freeQuantity: z.number().optional(),
          mrp: z.number().optional(),
          rate: z.number().optional(),
          discount: z.number().optional(),
          cgst: z.number().optional(),
          sgst: z.number().optional(),
          amount: z.number().optional(),
        })
      )
      .min(1),
  }),
})

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["PLACED", "CANCELLED", "DELIVERED"]),
  }),
})

const invoiceSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().min(1),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length === 0) {
    return runHandler(request, {}, [...withAuth, listOrders], undefined)
  }
  if (path.length === 1) {
    return runHandler(request, { id: path[0] }, [...withAuth, getOrder], undefined)
  }
  return notFound()
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, validate(createSchema), createOrderHandler], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id) return notFound()
  if (path[1] === "status") {
    return runHandler(
      request,
      { id },
      [...withAuth, requireAccountType("ADMIN", "DISTRIBUTOR"), validate(statusSchema), setOrderStatus],
      undefined
    )
  }
  if (path[1] === "invoice") {
    return runHandler(
      request,
      { id },
      [...withAuth, requireRole("ADMIN"), validate(invoiceSchema), setInvoiceNumber],
      undefined
    )
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
