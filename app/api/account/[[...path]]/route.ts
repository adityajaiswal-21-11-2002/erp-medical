import { runHandler } from "@/server/next-adapter"
import { getAccountProfile, updateConsent } from "@/server/controllers/accountController"
import { requireAuth } from "@/server/middleware/auth"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const consentSchema = z.object({
  body: z.object({
    consent: z.object({
      dpdpAccepted: z.boolean().optional(),
      marketingOptIn: z.boolean().optional(),
      acceptedAt: z.string().optional(),
      ipAddress: z.string().optional(),
      source: z.string().optional(),
    }),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "profile") {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, [...withAuth, getAccountProfile], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "consent") {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, [...withAuth, validate(consentSchema), updateConsent], undefined)
}
