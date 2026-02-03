import { Router } from "express"
import { z } from "zod"
import { createBanner, listBanners, updateBanner } from "../controllers/bannerController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { validate } from "../middleware/validate"

const router = Router()

const bannerSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    base64: z.string().optional(),
    placement: z.enum(["ADMIN", "RETAILER", "CUSTOMER"]).optional(),
    active: z.boolean().optional(),
  }),
})

const updateSchema = z.object({
  body: bannerSchema.shape.body.partial().refine((val) => Object.keys(val).length > 0),
})

router.use(requireAuth)
router.get("/", listBanners)
router.post("/", requireRole("ADMIN"), validate(bannerSchema), createBanner)
router.patch("/:id", requireRole("ADMIN"), validate(updateSchema), updateBanner)

export default router
