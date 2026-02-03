import { runHandler } from "@/server/next-adapter"
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from "@/server/controllers/userController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(6),
    role: z.enum(["ADMIN", "USER"]),
    accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      mobile: z.string().min(6).optional(),
      status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
      role: z.enum(["ADMIN", "USER"]).optional(),
      accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
      profileStatus: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    })
    .refine((val) => Object.keys(val).length > 0, "No updates provided"),
})

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6),
  }),
})

const admin = [requireAuth, requireRole("ADMIN")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, [...admin, listUsers], undefined)
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length > 0) {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, {}, [...admin, validate(createSchema), createUser], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  if (path[1] === "password") {
    return runHandler(
      request,
      { id },
      [...admin, validate(resetPasswordSchema), resetUserPassword],
      undefined
    )
  }
  return runHandler(request, { id }, [...admin, validate(updateSchema), updateUser], undefined)
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) {
    return new Response(JSON.stringify({ success: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  }
  return runHandler(request, { id }, [...admin, deleteUser], undefined)
}
