import { Router } from "express"
import { z } from "zod"
import { attributeReferral, getReferral, trackReferralClick } from "../controllers/referralController"
import { requireAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const trackSchema = z.object({
  body: z.object({
    refCode: z.string().min(3),
  }),
})

const attributeSchema = z.object({
  body: z.object({
    refCode: z.string().min(3),
    orderId: z.string().min(1),
    customerId: z.string().optional(),
  }),
})

router.use(requireAuth)
router.get("/me", getReferral)
router.post("/track", validate(trackSchema), trackReferralClick)
router.post("/attribute", validate(attributeSchema), attributeReferral)

export default router
