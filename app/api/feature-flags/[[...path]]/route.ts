import { runHandler } from "@/server/next-adapter"
import { listFlags, updateFlag } from "@/server/controllers/featureFlagController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const updateSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listFlags], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const key = path[0]
  if (!key) return notFound()
  return runHandler(
    request,
    { key },
    [...withAuth, requireRole("ADMIN"), validate(updateSchema), updateFlag],
    undefined
  )
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
