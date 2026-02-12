import { Router } from "express"
import { z } from "zod"
import {
  createShipment,
  getShipment,
  trackShipment,
  listShippingLogs,
  testShiprocketConnectivity,
  testRapidShypConnectivity,
} from "../controllers/shipmentController"
import { requireAuth } from "../middleware/auth"
import { requireAccountType } from "../middleware/accountType"
import { validate } from "../middleware/validate"

const router = Router()

const createBodySchema = z.object({
  body: z.object({
    provider: z.enum(["SHIPROCKET", "RAPIDSHYP"]).optional(),
    force: z.boolean().optional(),
  }),
})

router.use(requireAuth)

router.get("/logs", requireAccountType("ADMIN"), listShippingLogs)
router.get("/integrations/shiprocket/test", requireAccountType("ADMIN"), testShiprocketConnectivity)
router.get("/integrations/rapidshyp/test", requireAccountType("ADMIN"), testRapidShypConnectivity)

router.post(
  "/:orderId/create",
  requireAccountType("ADMIN", "DISTRIBUTOR"),
  validate(createBodySchema),
  createShipment,
)
router.post("/:orderId/track", trackShipment)
router.get("/:orderId", getShipment)

export default router
