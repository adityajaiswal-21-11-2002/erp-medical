"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const eventSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventType: zod_1.z.enum(["page_view", "search", "add_to_cart", "checkout", "order_placed", "login"]),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
router.use(auth_1.requireAuth);
router.post("/events", (0, validate_1.validate)(eventSchema), analyticsController_1.ingestEvent);
router.get("/summary", (0, role_1.requireRole)("ADMIN"), analyticsController_1.getAnalyticsSummary);
exports.default = router;
