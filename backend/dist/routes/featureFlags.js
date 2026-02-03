"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const featureFlagController_1 = require("../controllers/featureFlagController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const updateSchema = zod_1.z.object({
    body: zod_1.z.object({
        enabled: zod_1.z.boolean(),
    }),
});
router.use(auth_1.requireAuth);
router.get("/", featureFlagController_1.listFlags);
router.patch("/:key", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(updateSchema), featureFlagController_1.updateFlag);
exports.default = router;
