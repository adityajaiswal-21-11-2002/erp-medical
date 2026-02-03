"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const distributorController_1 = require("../controllers/distributorController");
const auth_1 = require("../middleware/auth");
const accountType_1 = require("../middleware/accountType");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        distributorStatus: zod_1.z.enum([
            "PENDING_APPROVAL",
            "APPROVED",
            "CONSOLIDATED",
            "ALLOCATED",
            "SHIPPED",
        ]),
        notes: zod_1.z.string().optional(),
    }),
});
router.use(auth_1.requireAuth, (0, accountType_1.requireAccountType)("DISTRIBUTOR", "ADMIN"));
router.get("/orders", distributorController_1.listDistributorOrders);
router.patch("/orders/:id", (0, validate_1.validate)(updateSchema), distributorController_1.updateDistributorOrder);
router.get("/inventory", distributorController_1.listInventoryAllocation);
router.get("/settlements", distributorController_1.listSettlements);
exports.default = router;
