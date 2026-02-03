"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        mobile: zod_1.z.string().min(6),
        role: zod_1.z.enum(["ADMIN", "USER"]),
        accountType: zod_1.z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
    }),
});
const updateSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        name: zod_1.z.string().min(1).optional(),
        mobile: zod_1.z.string().min(6).optional(),
        status: zod_1.z.enum(["ACTIVE", "BLOCKED"]).optional(),
        role: zod_1.z.enum(["ADMIN", "USER"]).optional(),
        accountType: zod_1.z.enum(["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"]).optional(),
        profileStatus: zod_1.z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    })
        .refine((val) => Object.keys(val).length > 0, "No updates provided"),
});
const resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().min(6),
    }),
});
router.use(auth_1.requireAuth, (0, role_1.requireRole)("ADMIN"));
router.get("/", userController_1.listUsers);
router.post("/", (0, validate_1.validate)(createSchema), userController_1.createUser);
router.patch("/:id", (0, validate_1.validate)(updateSchema), userController_1.updateUser);
router.patch("/:id/password", (0, validate_1.validate)(resetPasswordSchema), userController_1.resetUserPassword);
router.delete("/:id", userController_1.deleteUser);
exports.default = router;
