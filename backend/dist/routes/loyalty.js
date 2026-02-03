"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const loyaltyController_1 = require("../controllers/loyaltyController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
const pointsSchema = zod_1.z.object({
    body: zod_1.z.object({
        points: zod_1.z.number().min(1),
        source: zod_1.z.string().optional(),
    }),
});
router.use(auth_1.requireAuth);
router.get("/summary", loyaltyController_1.getLoyaltySummary);
router.post("/earn", (0, validate_1.validate)(pointsSchema), loyaltyController_1.earnPoints);
router.post("/redeem", (0, validate_1.validate)(pointsSchema), loyaltyController_1.redeemPoints);
exports.default = router;
