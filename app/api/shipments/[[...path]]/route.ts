import { runHandler } from "@/server/next-adapter"
import {
  createShipment,
  getShipment,
  trackShipment,
  listShippingLogs,
  testShiprocketConnectivity,
  testRapidShypConnectivity,
  runShiprocketDiagnostics,
  runRapidShypDiagnostics,
} from "@/server/controllers/shipmentController"
import { requireAuth } from "@/server/middleware/auth"
import { requireAccountType } from "@/server/middleware/accountType"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createBodySchema = z.object({
  body: z.object({
    provider: z.enum(["SHIPROCKET", "RAPIDSHYP"]).optional(),
    force: z.boolean().optional(),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length === 0) return notFound()
  if (path[0] === "logs" && path.length === 1) {
    return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN"), listShippingLogs], undefined)
  }
  if (path[0] === "integrations" && path[1] === "shiprocket" && path[2] === "test") {
    return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN"), testShiprocketConnectivity], undefined)
  }
  if (path[0] === "integrations" && path[1] === "shiprocket" && path[2] === "diagnose") {
    return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN"), runShiprocketDiagnostics], undefined)
  }
  if (path[0] === "integrations" && path[1] === "rapidshyp" && path[2] === "test") {
    return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN"), testRapidShypConnectivity], undefined)
  }
  if (path[0] === "integrations" && path[1] === "rapidshyp" && path[2] === "diagnose") {
    return runHandler(request, {}, [...withAuth, requireAccountType("ADMIN"), runRapidShypDiagnostics], undefined)
  }
  const orderId = path[0]
  if (path.length === 1 && orderId) {
    return runHandler(request, { orderId }, [...withAuth, getShipment], undefined)
  }
  return notFound()
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length < 1) return notFound()
  const orderId = path[0]
  if (path[1] === "create") {
    return runHandler(
      request,
      { orderId },
      [...withAuth, requireAccountType("ADMIN", "DISTRIBUTOR"), validate(createBodySchema), createShipment],
      undefined
    )
  }
  if (path[1] === "track") {
    return runHandler(request, { orderId }, [...withAuth, trackShipment], undefined)
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
