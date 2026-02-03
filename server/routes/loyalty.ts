import { Router } from "express"
import { z } from "zod"
import { earnPoints, getLoyaltySummary, redeemPoints } from "../controllers/loyaltyController"
import { requireAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const pointsSchema = z.object({
  body: z.object({
    points: z.number().min(1),
    source: z.string().optional(),
  }),
})

router.use(requireAuth)
router.get("/summary", getLoyaltySummary)
router.post("/earn", validate(pointsSchema), earnPoints)
router.post("/redeem", validate(pointsSchema), redeemPoints)

export default router
