import { Router } from "express"
import { z } from "zod"
import { getKycStatus, listKycSubmissions, reviewKyc, submitKyc } from "../controllers/kycController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const submitSchema = z.object({
  body: z.object({
    businessName: z.string().min(1),
    gstin: z.string().optional(),
    drugLicenseNumber: z.string().optional(),
    address: z.string().optional(),
    documents: z
      .array(
        z.object({
          type: z.string(),
          label: z.string().optional(),
          filePath: z.string().optional(),
          base64: z.string().optional(),
          metadata: z.record(z.any()).optional(),
        }),
      )
      .optional(),
  }),
})

const reviewSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "RESUBMIT"]),
    rejectionReason: z.string().optional(),
  }),
})

router.use(requireAuth)
router.post("/submit", validate(submitSchema), submitKyc)
router.get("/status", getKycStatus)
router.get("/submissions", requireRole("ADMIN"), listKycSubmissions)
router.patch("/submissions/:id", requireRole("ADMIN"), validate(reviewSchema), reviewKyc)

export default router
