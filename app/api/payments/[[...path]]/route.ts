import { runHandler } from "@/server/next-adapter"
import {
  createPaymentIntent,
  listPaymentIntents,
  paymentWebhook,
} from "@/server/controllers/paymentController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const intentSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    amount: z.number().min(1),
    currency: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
})

const webhookSchema = z.object({
  body: z.object({
    token: z.string().min(3),
    status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), listPaymentIntents], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (segment === "intent") {
    return runHandler(request, {}, [...withAuth, validate(intentSchema), createPaymentIntent], undefined)
  }
  if (segment === "webhook") {
    return runHandler(request, {}, [...withAuth, validate(webhookSchema), paymentWebhook], undefined)
  }
  return notFound()
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
