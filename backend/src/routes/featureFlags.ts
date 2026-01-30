import { Router } from "express"
import { z } from "zod"
import { listFlags, updateFlag } from "../controllers/featureFlagController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const updateSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
  }),
})

router.use(requireAuth)
router.get("/", listFlags)
router.patch("/:key", requireRole("ADMIN"), validate(updateSchema), updateFlag)

export default router
