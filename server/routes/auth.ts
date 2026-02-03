import { Router } from "express"
import { z } from "zod"
import { login, logout, me, register } from "../controllers/authController"
import { optionalAuth, requireAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(6),
    role: z.enum(["ADMIN", "USER"]).optional(),
    accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
    consent: z
      .object({
        dpdpAccepted: z.boolean().optional(),
        marketingOptIn: z.boolean().optional(),
        acceptedAt: z.string().optional(),
        ipAddress: z.string().optional(),
        source: z.string().optional(),
      })
      .optional(),
  }),
})

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
})

router.post("/register", optionalAuth, validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.post("/logout", requireAuth, logout)
router.get("/me", requireAuth, me)

export default router
