import { runHandler } from "@/server/next-adapter"
import {
  invoiceCallback,
  listInvoices,
  pushOrders,
  shipmentStatus,
  syncInventory,
  syncProducts,
} from "@/server/controllers/erpController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { requireAccountType } from "@/server/middleware/accountType"

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "invoices") return notFound()
  return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN", "DISTRIBUTOR"), listInvoices], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] === "sync" && path[1] === "products") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), syncProducts], undefined)
  }
  if (path[0] === "sync" && path[1] === "inventory") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), syncInventory], undefined)
  }
  if (path[0] === "orders") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), pushOrders], undefined)
  }
  if (path[0] === "invoice-callback") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), invoiceCallback], undefined)
  }
  if (path[0] === "shipment-status") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), shipmentStatus], undefined)
  }
  // Frontend calls /api/erp/sync/:type (e.g. products, inventory)
  if (path[0] === "sync" && path[1]) {
    const type = path[1]
    if (type === "products") {
      return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), syncProducts], undefined)
    }
    if (type === "inventory") {
      return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), syncInventory], undefined)
    }
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
