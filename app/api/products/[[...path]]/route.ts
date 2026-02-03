import { runHandler } from "@/server/next-adapter"
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
  updateProductPhoto,
} from "@/server/controllers/productController"
import { requireAuth } from "@/server/middleware/auth"
import { requireRole } from "@/server/middleware/role"
import { validate } from "@/server/middleware/validate"
import { z } from "zod"

const productSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    genericName: z.string().min(1),
    packaging: z.string().min(1),
    dosageForm: z.string().min(1),
    category: z.string().min(1),
    pts: z.number(),
    ptr: z.number(),
    netMrp: z.number(),
    mrp: z.number(),
    gstPercent: z.union([z.literal(0), z.literal(5), z.literal(12)]),
    hsnCode: z.string().min(1),
    shelfLife: z.string().min(1),
    currentStock: z.number(),
    strength: z.string().optional(),
    manufacturerName: z.string().optional(),
    batch: z.string().optional(),
    manufacturingDate: z.string().optional(),
    expiryDate: z.string().optional(),
    drugLicenseNumber: z.string().optional(),
    scheduleType: z.enum(["NON", "H", "H1", "X"]).optional(),
    packType: z.string().optional(),
    unitsPerPack: z.number().optional(),
    freeQuantity: z.number().optional(),
    sellingRate: z.number().optional(),
    discountPercent: z.number().optional(),
    discountValue: z.number().optional(),
    cgst: z.number().optional(),
    sgst: z.number().optional(),
    taxableValue: z.number().optional(),
    totalGstAmount: z.number().optional(),
    openingStock: z.number().optional(),
    minimumStockAlert: z.number().optional(),
    stockUnit: z.enum(["Strip", "Box", "Bottle"]).optional(),
    stockStatus: z.enum(["IN_STOCK", "LOW", "OUT"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    photoBase64: z.string().optional(),
  }),
})

const productUpdateSchema = z.object({
  body: productSchema.shape.body.partial().refine((val) => Object.keys(val).length > 0),
})

const photoSchema = z.object({
  body: z.object({
    photoBase64: z.string().min(1),
  }),
})

const admin = [requireAuth, requireRole("ADMIN")]

export const dynamic = "force-dynamic"

type Params = { path?: string[] }

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length === 0) {
    return runHandler(request, {}, [listProducts], undefined)
  }
  if (path.length === 1) {
    return runHandler(request, { id: path[0] }, [getProduct], undefined)
  }
  return notFound()
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  if (path.length === 0) {
    return runHandler(request, {}, [...admin, validate(productSchema), createProduct], undefined)
  }
  if (path.length === 1 && path[0]) {
    return notFound()
  }
  if (path.length === 2 && path[1] === "photo") {
    return runHandler(
      request,
      { id: path[0] },
      [...admin, validate(photoSchema), updateProductPhoto],
      undefined
    )
  }
  return notFound()
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) return notFound()
  return runHandler(request, { id }, [...admin, validate(productUpdateSchema), updateProduct], undefined)
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  const { path = [] } = await params
  const id = path[0]
  if (!id || path.length > 1) return notFound()
  return runHandler(request, { id }, [...admin, deleteProduct], undefined)
}

function notFound() {
  return new Response(JSON.stringify({ success: false, error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  })
}
