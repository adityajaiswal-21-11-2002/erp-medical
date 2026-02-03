"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const accountController_1 = require("../controllers/accountController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const consentSchema = zod_1.z.object({
    body: zod_1.z.object({
        consent: zod_1.z.object({
            dpdpAccepted: zod_1.z.boolean().optional(),
            marketingOptIn: zod_1.z.boolean().optional(),
            acceptedAt: zod_1.z.string().optional(),
            ipAddress: zod_1.z.string().optional(),
            source: zod_1.z.string().optional(),
        }),
    }),
});
router.use(auth_1.requireAuth);
router.get("/profile", accountController_1.getAccountProfile);
router.patch("/consent", (0, validate_1.validate)(consentSchema), accountController_1.updateConsent);
exports.default = router;
