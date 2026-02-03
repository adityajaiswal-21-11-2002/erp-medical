import { Router } from "express"
import { z } from "zod"
import { createTicket, listTickets, updateTicket } from "../controllers/ticketController"
import { requireAuth } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const createSchema = z.object({
  body: z.object({
    subject: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  }),
})

const updateSchema = z.object({
  body: z
    .object({
      status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      assignedTo: z.string().optional(),
    })
    .refine((val) => Object.keys(val).length > 0),
})

router.use(requireAuth)
router.get("/", listTickets)
router.post("/", validate(createSchema), createTicket)
router.patch("/:id", validate(updateSchema), updateTicket)

export default router
