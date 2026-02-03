import { Router } from "express"
import { z } from "zod"
import { createPaymentIntent, listPaymentIntents, paymentWebhook } from "../controllers/paymentController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const intentSchema = z.object({
  body: z.object({
    orderId: z.string().optional(),
    amount: z.number().min(1),
    currency: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
})

const webhookSchema = z.object({
  body: z.object({
    token: z.string().min(3),
    status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  }),
})

router.use(requireAuth)
router.post("/intent", validate(intentSchema), createPaymentIntent)
router.post("/webhook", validate(webhookSchema), paymentWebhook)
router.get("/", requireRole("ADMIN"), listPaymentIntents)

export default router
