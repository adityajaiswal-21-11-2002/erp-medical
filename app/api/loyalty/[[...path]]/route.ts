import { runHandler } from "@/server/next-adapter"
import { earnPoints, getLoyaltySummary, redeemPoints } from "@/server/controllers/loyaltyController"
import { requireAuth } from "@/server/middleware/auth"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const pointsSchema = z.object({
  body: z.object({
    points: z.number().min(1),
    source: z.string().optional(),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "summary") return notFound()
  return runHandler(request, {}, [...withAuth, getLoyaltySummary], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (segment === "earn") {
    return runHandler(request, {}, [...withAuth, validate(pointsSchema), earnPoints], undefined)
  }
  if (segment === "redeem") {
    return runHandler(request, {}, [...withAuth, validate(pointsSchema), redeemPoints], undefined)
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
