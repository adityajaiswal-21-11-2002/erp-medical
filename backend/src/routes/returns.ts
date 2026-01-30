import { Router } from "express"
import { z } from "zod"
import { createReturn, listReturns, updateReturn } from "../controllers/returnController"
import { requireAuth } from "../middleware/auth"
import { requireFeatureFlag } from "../middleware/featureFlag"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    orderId: z.string().min(1),
    reason: z.string().min(3),
    notes: z.string().optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      status: z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
      notes: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0),
})

router.use(requireAuth, requireFeatureFlag("RETURNS_ENABLED"))
router.get("/", listReturns)
router.post("/", validate(createSchema), createReturn)
router.patch("/:id", validate(updateSchema), updateReturn)

export default router
