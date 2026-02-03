import { runHandler } from "@/server/next-adapter"
import { login, logout, me, register } from "@/server/controllers/authController"
import { optionalAuth, requireAuth } from "@/server/middleware/auth"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(6),
    role: z.enum(["ADMIN", "USER"]).optional(),
    accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
    consent: z
      .object({
        dpdpAccepted: z.boolean().optional(),
        marketingOptIn: z.boolean().optional(),
        acceptedAt: z.string().optional(),
        ipAddress: z.string().optional(),
        source: z.string().optional(),
      })
      .optional(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
})

type Handler = (req: unknown, res: unknown, next: () => void | Promise<void>) => void | Promise<void>

const routes: Record<string, Handler[]> = {
  register: [optionalAuth, validate(registerSchema), register],
  login: [validate(loginSchema), login],
  logout: [requireAuth, logout],
  me: [requireAuth, me],
}

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (segment !== "me") {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, routes.me, undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (!segment || segment === "me" || !routes[segment]) {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, routes[segment], undefined)
}
