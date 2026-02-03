"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        mobile: zod_1.z.string().min(6),
        role: zod_1.z.enum(["ADMIN", "USER"]).optional(),
        accountType: zod_1.z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
        consent: zod_1.z
            .object({
            dpdpAccepted: zod_1.z.boolean().optional(),
            marketingOptIn: zod_1.z.boolean().optional(),
            acceptedAt: zod_1.z.string().optional(),
            ipAddress: zod_1.z.string().optional(),
            source: zod_1.z.string().optional(),
        })
            .optional(),
    }),
});
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    }),
});
router.post("/register", auth_1.optionalAuth, (0, validate_1.validate)(registerSchema), authController_1.register);
router.post("/login", (0, validate_1.validate)(loginSchema), authController_1.login);
router.post("/logout", auth_1.requireAuth, authController_1.logout);
router.get("/me", auth_1.requireAuth, authController_1.me);
exports.default = router;
