import { Router } from "express"
import { invoiceCallback, listInvoices, pushOrders, shipmentStatus, syncInventory, syncProducts } from "../controllers/erpController"
import { requireAuth } from "../middleware/auth"
import { requireRole } from "../middleware/role"
import { requireAccountType } from "../middleware/accountType"

const router = Router()

router.use(requireAuth)
router.post("/sync/products", requireRole("ADMIN"), syncProducts)
router.post("/sync/inventory", requireRole("ADMIN"), syncInventory)
router.post("/orders", requireRole("ADMIN"), pushOrders)
router.post("/invoice-callback", requireRole("ADMIN"), invoiceCallback)
router.post("/shipment-status", requireRole("ADMIN"), shipmentStatus)
router.get("/invoices", requireAccountType("ADMIN", "DISTRIBUTOR"), listInvoices)

export default router
