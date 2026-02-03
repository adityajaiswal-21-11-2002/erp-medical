import { Router } from "express"
import { z } from "zod"
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from "../controllers/userController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    mobile: z.string().min(6),
    role: z.enum(["ADMIN", "USER"]),
    accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      mobile: z.string().min(6).optional(),
      status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
      role: z.enum(["ADMIN", "USER"]).optional(),
      accountType: z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
      profileStatus: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    })
    .refine((val) => Object.keys(val).length > 0, "No updates provided"),
})

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6),
  }),
})

router.use(requireAuth, requireRole("ADMIN"))
router.get("/", listUsers)
router.post("/", validate(createSchema), createUser)
router.patch("/:id", validate(updateSchema), updateUser)
router.patch("/:id/password", validate(resetPasswordSchema), resetUserPassword)
router.delete("/:id", deleteUser)

export default router
