"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const intentSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().optional(),
        amount: zod_1.z.number().min(1),
        currency: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const webhookSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(3),
        status: zod_1.z.enum(["PENDING", "SUCCESS", "FAILED"]),
    }),
});
router.use(auth_1.requireAuth);
router.post("/intent", (0, validate_1.validate)(intentSchema), paymentController_1.createPaymentIntent);
router.post("/webhook", (0, validate_1.validate)(webhookSchema), paymentController_1.paymentWebhook);
router.get("/", (0, role_1.requireRole)("ADMIN"), paymentController_1.listPaymentIntents);
exports.default = router;
