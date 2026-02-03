"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const returnController_1 = require("../controllers/returnController");
const auth_1 = require("../middleware/auth");
const featureFlag_1 = require("../middleware/featureFlag");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1),
        reason: zod_1.z.string().min(3),
        notes: zod_1.z.string().optional(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        status: zod_1.z.enum(["REQUESTED", "APPROVED", "REJECTED"]).optional(),
        notes: zod_1.z.string().optional(),
    })
        .refine((val) => Object.keys(val).length > 0),
});
router.use(auth_1.requireAuth, (0, featureFlag_1.requireFeatureFlag)("RETURNS_ENABLED"));
router.get("/", returnController_1.listReturns);
router.post("/", (0, validate_1.validate)(createSchema), returnController_1.createReturn);
router.patch("/:id", (0, validate_1.validate)(updateSchema), returnController_1.updateReturn);
exports.default = router;
