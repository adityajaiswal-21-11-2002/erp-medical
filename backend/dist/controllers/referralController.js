"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferral = getReferral;
exports.trackReferralClick = trackReferralClick;
exports.attributeReferral = attributeReferral;
const Referral_1 = __importDefault(require("../models/Referral"));
const ReferralAttribution_1 = __importDefault(require("../models/ReferralAttribution"));
const response_1 = require("../utils/response");
function generateRefCode() {
    return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function getReferral(req, res) {
    let referral = await Referral_1.default.findOne({ retailerId: req.user?.id });
    if (!referral) {
        referral = await Referral_1.default.create({
            retailerId: req.user?.id,
            refCode: generateRefCode(),
        });
    }
    return (0, response_1.sendSuccess)(res, referral, "Referral fetched");
}
async function trackReferralClick(req, res) {
    const { refCode } = req.body;
    const referral = await Referral_1.default.findOneAndUpdate({ refCode }, { $inc: { clicks: 1 } }, { new: true });
    return (0, response_1.sendSuccess)(res, referral, "Referral click tracked");
}
async function attributeReferral(req, res) {
    const { refCode, orderId, customerId } = req.body;
    const referral = await Referral_1.default.findOne({ refCode });
    if (!referral) {
        return (0, response_1.sendSuccess)(res, null, "Referral not found");
    }
    await ReferralAttribution_1.default.create({
        refCode,
        retailerId: referral.retailerId,
        orderId,
        customerId,
    });
    referral.attributedOrders += 1;
    await referral.save();
    return (0, response_1.sendSuccess)(res, referral, "Referral attributed");
}
