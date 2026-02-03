import { runHandler } from "@/server/next-adapter"
import {
  createReward,
  listRewards,
  makeWish,
  redeemReward,
  scratchCard,
} from "@/server/controllers/rewardController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(["SCRATCH_CARD", "MAGIC_STORE"]),
    pointsCost: z.number().optional(),
    rules: z.string().optional(),
    active: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
})

const wishSchema = z.object({
  body: z.object({
    wish: z.string().min(3),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listRewards], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length === 0) {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), validate(createSchema), createReward], undefined)
  }
  if (path[0] === "scratch") {
    return runHandler(request, {}, [...withAuth, scratchCard], undefined)
  }
  if (path[0] === "wish") {
    return runHandler(request, {}, [...withAuth, validate(wishSchema), makeWish], undefined)
  }
  if (path.length === 2 && path[1] === "redeem") {
    return runHandler(request, { id: path[0] }, [...withAuth, redeemReward], undefined)
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
