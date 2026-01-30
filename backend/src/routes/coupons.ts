import { Router } from "express"
import { z } from "zod"
import { createCoupon, listCoupons } from "../controllers/couponController"
import { requireAuth } from "../middleware/auth"
import { requireFeatureFlag } from "../middleware/featureFlag"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    code: z.string().min(3),
    description: z.string().optional(),
    discountPercent: z.number().min(0).max(100).optional(),
    active: z.boolean().optional(),
  }),
})

router.use(requireAuth, requireFeatureFlag("COUPONS_ENABLED"))
router.get("/", listCoupons)
router.post("/", requireRole("ADMIN"), validate(createSchema), createCoupon)

export default router
