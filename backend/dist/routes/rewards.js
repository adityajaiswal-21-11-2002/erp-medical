"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const rewardController_1 = require("../controllers/rewardController");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const createSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
        type: zod_1.z.enum(["SCRATCH_CARD", "MAGIC_STORE"]),
        pointsCost: zod_1.z.number().optional(),
        rules: zod_1.z.string().optional(),
        active: zod_1.z.boolean().optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
const wishSchema = zod_1.z.object({
    body: zod_1.z.object({
        wish: zod_1.z.string().min(3),
    }),
});
router.use(auth_1.requireAuth);
router.get("/", rewardController_1.listRewards);
router.post("/", (0, role_1.requireRole)("ADMIN"), (0, validate_1.validate)(createSchema), rewardController_1.createReward);
router.post("/:id/redeem", rewardController_1.redeemReward);
router.post("/scratch", rewardController_1.scratchCard);
router.post("/wish", (0, validate_1.validate)(wishSchema), rewardController_1.makeWish);
exports.default = router;
