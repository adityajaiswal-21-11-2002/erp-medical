"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRewards = listRewards;
exports.createReward = createReward;
exports.redeemReward = redeemReward;
exports.scratchCard = scratchCard;
exports.makeWish = makeWish;
const RewardCatalog_1 = __importDefault(require("../models/RewardCatalog"));
const LoyaltyLedger_1 = __importDefault(require("../models/LoyaltyLedger"));
const response_1 = require("../utils/response");
async function listRewards(_req, res) {
    const items = await RewardCatalog_1.default.find({ active: true }).sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, items, "Rewards fetched");
}
async function createReward(req, res) {
    const reward = await RewardCatalog_1.default.create(req.body);
    return (0, response_1.sendSuccess)(res, reward, "Reward created");
}
async function redeemReward(req, res) {
    const reward = await RewardCatalog_1.default.findById(req.params.id);
    if (!reward) {
        return (0, response_1.sendSuccess)(res, null, "Reward not found");
    }
    if (reward.pointsCost > 0) {
        await LoyaltyLedger_1.default.create({
            userId: req.user?.id,
            points: reward.pointsCost,
            type: "REDEEM",
            source: `REWARD:${reward.name}`,
        });
    }
    return (0, response_1.sendSuccess)(res, { reward }, "Reward redeemed");
}
async function scratchCard(req, res) {
    const reward = await RewardCatalog_1.default.findOne({ type: "SCRATCH_CARD", active: true });
    const points = Math.floor(Math.random() * 50) + 10;
    await LoyaltyLedger_1.default.create({
        userId: req.user?.id,
        points,
        type: "EARN",
        source: "SCRATCH_CARD",
    });
    return (0, response_1.sendSuccess)(res, { reward, points }, "Scratch card redeemed");
}
async function makeWish(req, res) {
    const points = Math.floor(Math.random() * 100) + 50;
    await LoyaltyLedger_1.default.create({
        userId: req.user?.id,
        points,
        type: "EARN",
        source: "MAKE_A_WISH",
        metadata: { wish: req.body.wish },
    });
    return (0, response_1.sendSuccess)(res, { points }, "Wish submitted");
}
