"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bannerController_1 = require("../controllers/bannerController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const bannerSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().optional(),
        base64: zod_1.z.string().optional(),
        placement: zod_1.z.enum(["ADMIN", "RETAILER", "CUSTOMER"]).optional(),
        active: zod_1.z.boolean().optional(),
    }),
});
const updateSchema = zod_1.z.object({
    body: bannerSchema.shape.body.partial().refine((val) => Object.keys(val).length > 0),
});
router.use(auth_1.requireAuth);
router.get("/", bannerController_1.listBanners);
router.post("/", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(bannerSchema), bannerController_1.createBanner);
router.patch("/:id", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(updateSchema), bannerController_1.updateBanner);
exports.default = router;
