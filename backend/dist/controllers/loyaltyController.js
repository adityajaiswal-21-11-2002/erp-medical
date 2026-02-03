"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoyaltySummary = getLoyaltySummary;
exports.earnPoints = earnPoints;
exports.redeemPoints = redeemPoints;
const LoyaltyLedger_1 = __importDefault(require("../models/LoyaltyLedger"));
const response_1 = require("../utils/response");
function resolveTier(points) {
    if (points >= 1000)
        return "GOLD";
    if (points >= 500)
        return "SILVER";
    return "BRONZE";
}
async function getLoyaltySummary(req, res) {
    const ledger = await LoyaltyLedger_1.default.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    const points = ledger.reduce((sum, entry) => sum + (entry.type === "REDEEM" ? -entry.points : entry.points), 0);
    const tier = resolveTier(points);
    return (0, response_1.sendSuccess)(res, { points, tier, ledger }, "Loyalty summary fetched");
}
async function earnPoints(req, res) {
    const entry = await LoyaltyLedger_1.default.create({
        userId: req.user?.id,
        points: req.body.points,
        type: "EARN",
        source: req.body.source || "ORDER",
        tier: resolveTier(req.body.points || 0),
    });
    return (0, response_1.sendSuccess)(res, entry, "Points awarded");
}
async function redeemPoints(req, res) {
    const entry = await LoyaltyLedger_1.default.create({
        userId: req.user?.id,
        points: req.body.points,
        type: "REDEEM",
        source: req.body.source || "REWARD",
        tier: resolveTier(req.body.points || 0),
    });
    return (0, response_1.sendSuccess)(res, entry, "Points redeemed");
}
