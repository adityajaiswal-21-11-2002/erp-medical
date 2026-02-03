import { Router } from "express"
import { z } from "zod"
import { getAccountProfile, updateConsent } from "../controllers/accountController"
import { requireAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const consentSchema = z.object({
  body: z.object({
    consent: z.object({
      dpdpAccepted: z.boolean().optional(),
      marketingOptIn: z.boolean().optional(),
      acceptedAt: z.string().optional(),
      ipAddress: z.string().optional(),
      source: z.string().optional(),
    }),
  }),
})

router.use(requireAuth)
router.get("/profile", getAccountProfile)
router.patch("/consent", validate(consentSchema), updateConsent)

export default router
