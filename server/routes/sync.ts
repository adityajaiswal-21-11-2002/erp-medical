import { Router } from "express"
import { listSyncLogs, retrySync } from "../controllers/syncController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"

const router = Router()

router.use(requireAuth, requireRole("ADMIN"))
router.get("/logs", listSyncLogs)
router.post("/retry/:id", retrySync)

export default router
