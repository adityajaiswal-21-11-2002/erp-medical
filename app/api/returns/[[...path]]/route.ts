import { runHandler } from "@/server/next-adapter"
import { createReturn, listReturns, updateReturn } from "@/server/controllers/returnController"
import { requireAuth } from "@/server/middleware/auth"
import { requireFeatureFlag } from "@/server/middleware/featureFlag"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    reason: z.string().min(3),
    notes: z.string().optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      status: z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
      notes: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0),
})

const withAuth = [requireAuth, requireFeatureFlag("RETURNS_ENABLED")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listReturns], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, validate(createSchema), createReturn], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) return notFound()
  return runHandler(request, { id }, [...withAuth, validate(updateSchema), updateReturn], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
