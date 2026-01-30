import { Router } from "express"
import { z } from "zod"
import { createReward, listRewards, makeWish, redeemReward, scratchCard } from "../controllers/rewardController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.enum(["SCRATCH_CARD", "MAGIC_STORE"]),
    pointsCost: z.number().optional(),
    rules: z.string().optional(),
    active: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
})

const wishSchema = z.object({
  body: z.object({
    wish: z.string().min(3),
  }),
})

router.use(requireAuth)
router.get("/", listRewards)
router.post("/", requireRole("ADMIN"), validate(createSchema), createReward)
router.post("/:id/redeem", redeemReward)
router.post("/scratch", scratchCard)
router.post("/wish", validate(wishSchema), makeWish)

export default router
