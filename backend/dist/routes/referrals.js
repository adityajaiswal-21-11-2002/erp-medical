"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const referralController_1 = require("../controllers/referralController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const trackSchema = zod_1.z.object({
    body: zod_1.z.object({
        refCode: zod_1.z.string().min(3),
    }),
});
const attributeSchema = zod_1.z.object({
    body: zod_1.z.object({
        refCode: zod_1.z.string().min(3),
        orderId: zod_1.z.string().min(1),
        customerId: zod_1.z.string().optional(),
    }),
});
router.use(auth_1.requireAuth);
router.get("/me", referralController_1.getReferral);
router.post("/track", (0, validate_1.validate)(trackSchema), referralController_1.trackReferralClick);
router.post("/attribute", (0, validate_1.validate)(attributeSchema), referralController_1.attributeReferral);
exports.default = router;
