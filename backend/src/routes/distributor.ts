import { Router } from "express"
import { z } from "zod"
import {
  listDistributorOrders,
  listInventoryAllocation,
  listSettlements,
  updateDistributorOrder,
} from "../controllers/distributorController"
import { requireAuth } from "../middleware/auth"
import { requireAccountType } from "../middleware/accountType"
import { validate } from "../middleware/validate"

const router = Router()

const updateSchema = z.object({
  body: z.object({
    distributorStatus: z.enum([
      "PENDING_APPROVAL",
      "APPROVED",
      "CONSOLIDATED",
      "ALLOCATED",
      "SHIPPED",
    ]),
    notes: z.string().optional(),
  }),
})

router.use(requireAuth, requireAccountType("DISTRIBUTOR", "ADMIN"))
router.get("/orders", listDistributorOrders)
router.patch("/orders/:id", validate(updateSchema), updateDistributorOrder)
router.get("/inventory", listInventoryAllocation)
router.get("/settlements", listSettlements)

export default router
