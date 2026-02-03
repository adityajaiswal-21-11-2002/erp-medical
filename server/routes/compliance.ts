import { Router } from "express"
import { listComplianceLogs } from "../controllers/complianceController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.use(requireAuth, requireRole("ADMIN"))
router.get("/", listComplianceLogs)

export default router
