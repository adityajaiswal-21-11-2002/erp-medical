import { runHandler } from "@/server/next-adapter"
import {
  listDistributorOrders,
  listInventoryAllocation,
  listSettlements,
  updateDistributorOrder,
} from "@/server/controllers/distributorController"
import { requireAuth } from "@/server/middleware/auth"
import { requireAccountType } from "@/server/middleware/accountType"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const updateSchema = z.object({
  body: z.object({
    distributorStatus: z.enum([
      "PENDING_APPROVAL",
      "APPROVED",
      "CONSOLIDATED",
      "ALLOCATED",
      "SHIPPED",
    ]),
    notes: z.string().optional(),
  }),
})

const withAuth = [requireAuth, requireAccountType("DISTRIBUTOR", "ADMIN")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (segment === "orders") {
    return runHandler(request, {}, [...withAuth, listDistributorOrders], undefined)
  }
  if (segment === "inventory") {
    return runHandler(request, {}, [...withAuth, listInventoryAllocation], undefined)
  }
  if (segment === "settlements") {
    return runHandler(request, {}, [...withAuth, listSettlements], undefined)
  }
  return notFound()
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "orders" || !path[1]) return notFound()
  return runHandler(
    request,
    { id: path[1] },
    [...withAuth, validate(updateSchema), updateDistributorOrder],
    undefined
  )
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
