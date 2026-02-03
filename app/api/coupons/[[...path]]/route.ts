import { runHandler } from "@/server/next-adapter"
import { createCoupon, listCoupons } from "@/server/controllers/couponController"
import { requireAuth } from "@/server/middleware/auth"
import { requireFeatureFlag } from "@/server/middleware/featureFlag"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    description: z.string().optional(),
    discountPercent: z.number().min(0).max(100).optional(),
    active: z.boolean().optional(),
  }),
})

const withAuth = [requireAuth, requireFeatureFlag("COUPONS_ENABLED")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listCoupons], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), validate(createSchema), createCoupon], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
