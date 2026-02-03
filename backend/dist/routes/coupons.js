"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const couponController_1 = require("../controllers/couponController");
const auth_1 = require("../middleware/auth");
const featureFlag_1 = require("../middleware/featureFlag");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3),
        description: zod_1.z.string().optional(),
        discountPercent: zod_1.z.number().min(0).max(100).optional(),
        active: zod_1.z.boolean().optional(),
    }),
});
router.use(auth_1.requireAuth, (0, featureFlag_1.requireFeatureFlag)("COUPONS_ENABLED"));
router.get("/", couponController_1.listCoupons);
router.post("/", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(createSchema), couponController_1.createCoupon);
exports.default = router;
