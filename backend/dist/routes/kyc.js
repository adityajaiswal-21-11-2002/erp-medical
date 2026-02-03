"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const kycController_1 = require("../controllers/kycController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const submitSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(1),
        gstin: zod_1.z.string().optional(),
        drugLicenseNumber: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
        documents: zod_1.z
            .array(zod_1.z.object({
            type: zod_1.z.string(),
            label: zod_1.z.string().optional(),
            filePath: zod_1.z.string().optional(),
            base64: zod_1.z.string().optional(),
            metadata: zod_1.z.record(zod_1.z.any()).optional(),
        }))
            .optional(),
    }),
});
const reviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["APPROVED", "REJECTED", "RESUBMIT"]),
        rejectionReason: zod_1.z.string().optional(),
    }),
});
router.use(auth_1.requireAuth);
router.post("/submit", (0, validate_1.validate)(submitSchema), kycController_1.submitKyc);
router.get("/status", kycController_1.getKycStatus);
router.get("/submissions", (0, role_1.requireRole)("ADMIN"), kycController_1.listKycSubmissions);
router.patch("/submissions/:id", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(reviewSchema), kycController_1.reviewKyc);
exports.default = router;
