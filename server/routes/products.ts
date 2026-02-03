import { Router } from "express"
import { z } from "zod"
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
  updateProductPhoto,
} from "../controllers/productController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

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

router.get("/", listProducts)
router.get("/:id", getProduct)

router.post("/", requireAuth, requireRole("ADMIN"), validate(productSchema), createProduct)
router.patch("/:id", requireAuth, requireRole("ADMIN"), validate(productUpdateSchema), updateProduct)
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteProduct)
router.post("/:id/photo", requireAuth, requireRole("ADMIN"), validate(photoSchema), updateProductPhoto)

export default router
