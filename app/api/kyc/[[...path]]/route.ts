import { runHandler } from "@/server/next-adapter"
import { getKycStatus, listKycSubmissions, reviewKyc, submitKyc } from "@/server/controllers/kycController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const submitSchema = z.object({
  body: z.object({
    businessName: z.string().min(1),
    gstin: z.string().optional(),
    drugLicenseNumber: z.string().optional(),
    address: z.string().optional(),
    documents: z
      .array(
        z.object({
          type: z.string(),
          label: z.string().optional(),
          filePath: z.string().optional(),
          base64: z.string().optional(),
          metadata: z.record(z.any()).optional(),
        })
      )
      .optional(),
  }),
})

const reviewSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "RESUBMIT"]),
    rejectionReason: z.string().optional(),
  }),
})

const withAuth = [requireAuth]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const segment = path[0]
  if (segment === "status") {
    return runHandler(request, {}, [...withAuth, getKycStatus], undefined)
  }
  if (segment === "submissions") {
    return runHandler(request, {}, [...withAuth, requireRole("ADMIN"), listKycSubmissions], undefined)
  }
  return notFound()
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "submit") return notFound()
  return runHandler(request, {}, [...withAuth, validate(submitSchema), submitKyc], undefined)
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path[0] !== "submissions" || !path[1]) return notFound()
  return runHandler(
    request,
    { id: path[1] },
    [...withAuth, requireRole("ADMIN"), validate(reviewSchema), reviewKyc],
    undefined
  )
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
