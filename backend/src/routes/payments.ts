import { Router } from "express"
import { z } from "zod"
import { createPaymentIntent, listPaymentIntents, paymentWebhook } from "../controllers/paymentController"
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  listRazorpayPayments,
  listWebhookEvents,
} from "../controllers/razorpayController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { requireAccountType } from "../middleware/accountType"
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

const razorpayOrderSchema = z.object({
  body: z.object({ orderId: z.string().min(1) }),
})

const razorpayVerifySchema = z.object({
  body: z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    internalOrderId: z.string(),
  }),
})

router.use(requireAuth)
router.post("/intent", validate(intentSchema), createPaymentIntent)
router.post("/webhook", validate(webhookSchema), paymentWebhook)
router.get("/", requireRole("ADMIN"), listPaymentIntents)
router.post("/razorpay/order", validate(razorpayOrderSchema), createRazorpayOrder)
router.post("/razorpay/verify", validate(razorpayVerifySchema), verifyRazorpayPayment)
router.get("/razorpay", requireAccountType("ADMIN"), listRazorpayPayments)
router.get("/webhook-events", requireAccountType("ADMIN"), listWebhookEvents)

export default router
