import { Router } from "express"
import { z } from "zod"
import { getAnalyticsSummary, ingestEvent } from "../controllers/analyticsController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const eventSchema = z.object({
  body: z.object({
    eventType: z.enum(["page_view", "search", "add_to_cart", "checkout", "order_placed", "login"]),
    metadata: z.record(z.any()).optional(),
  }),
})

router.use(requireAuth)
router.post("/events", validate(eventSchema), ingestEvent)
router.get("/summary", requireRole("ADMIN"), getAnalyticsSummary)

export default router
