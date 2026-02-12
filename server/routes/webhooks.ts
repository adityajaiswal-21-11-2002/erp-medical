import { Router } from "express"
import { shiprocketWebhook, rapidshypWebhook } from "../controllers/shipmentController"
import { razorpayWebhook } from "../controllers/razorpayController"

const router = Router()

router.post("/shiprocket", shiprocketWebhook)
router.post("/rapidshyp", rapidshypWebhook)
router.post("/razorpay", razorpayWebhook)

export default router
