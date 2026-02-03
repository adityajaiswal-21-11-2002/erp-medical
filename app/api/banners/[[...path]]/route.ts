import { runHandler } from "@/server/next-adapter"
import { createBanner, listBanners, updateBanner } from "@/server/controllers/bannerController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const bannerSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    base64: z.string().optional(),
    placement: z.enum(["ADMIN", "RETAILER", "CUSTOMER"]).optional(),
    active: z.boolean().optional(),
  }),
})

const updateSchema = z.object({
  body: bannerSchema.shape.body.partial().refine((val) => Object.keys(val).length > 0),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listBanners], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), validate(bannerSchema), createBanner], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) return notFound()
  return runHandler(request, { id }, [...withAuth, requireRole("ADMIN"), validate(updateSchema), updateBanner], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
