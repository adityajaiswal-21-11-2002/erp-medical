import { Router } from "express"
import { z } from "zod"
import {
  createOrderHandler,
  getOrder,
  listOrders,
  setInvoiceNumber,
  setOrderStatus,
} from "../controllers/orderController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { requireAccountType } from "../middleware/accountType"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    customerName: z.string().min(1),
    customerMobile: z.string().min(6),
    customerAddress: z.string().min(3),
    gstin: z.string().optional(),
    doctorName: z.string().optional(),
    referralCode: z.string().optional(),
    items: z
      .array(
        z.object({
          product: z.string().min(1),
          batch: z.string().optional(),
          expiry: z.string().optional(),
          quantity: z.number().min(1),
          freeQuantity: z.number().optional(),
          mrp: z.number().optional(),
          rate: z.number().optional(),
          discount: z.number().optional(),
          cgst: z.number().optional(),
          sgst: z.number().optional(),
          amount: z.number().optional(),
        }),
      )
      .min(1),
  }),
})

const statusSchema = z.object({
  body: z.object({
    status: z.enum(["PLACED", "CANCELLED", "DELIVERED"]),
  }),
})

const invoiceSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().min(1),
  }),
})

router.use(requireAuth)
router.get("/", listOrders)
router.get("/:id", getOrder)
router.post("/", validate(createSchema), createOrderHandler)
router.patch(
  "/:id/status",
  requireAccountType("ADMIN", "DISTRIBUTOR"),
  validate(statusSchema),
  setOrderStatus,
)
router.patch("/:id/invoice", requireRole("ADMIN"), validate(invoiceSchema), setInvoiceNumber)

export default router
