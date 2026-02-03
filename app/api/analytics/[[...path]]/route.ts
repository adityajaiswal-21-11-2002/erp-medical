import { runHandler } from "@/server/next-adapter"
import { getAnalyticsSummary, ingestEvent } from "@/server/controllers/analyticsController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const eventSchema = z.object({
  body: z.object({
    eventType: z.enum(["page_view", "search", "add_to_cart", "checkout", "order_placed", "login"]),
    metadata: z.record(z.any()).optional(),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "summary") return notFound()
  return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), getAnalyticsSummary], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "events") return notFound()
  return runHandler(request, {}, [...withAuth, validate(eventSchema), ingestEvent], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
