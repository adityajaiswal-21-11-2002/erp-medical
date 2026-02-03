import { runHandler } from "@/server/next-adapter"
import { createTicket, listTickets, updateTicket } from "@/server/controllers/ticketController"
import { requireAuth } from "@/server/middleware/auth"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    subject: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      assignedTo: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, listTickets], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) return notFound()
  return runHandler(request, {}, [...withAuth, validate(createSchema), createTicket], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) return notFound()
  return runHandler(request, { id }, [...withAuth, validate(updateSchema), updateTicket], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
