"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = createPaymentIntent;
exports.paymentWebhook = paymentWebhook;
exports.listPaymentIntents = listPaymentIntents;
const PaymentIntent_1 = __importDefault(require("../models/PaymentIntent"));
const response_1 = require("../utils/response");
const complianceService_1 = require("../services/complianceService");
async function createPaymentIntent(req, res) {
    const token = `tok_${Math.random().toString(36).slice(2)}`;
    const intent = await PaymentIntent_1.default.create({
        userId: req.user?.id,
        orderId: req.body.orderId,
        amount: req.body.amount,
        currency: req.body.currency || "INR",
        token,
        metadata: req.body.metadata,
    });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user?.id,
        action: "PAYMENT_INTENT_CREATED",
        subjectType: "PaymentIntent",
        subjectId: intent._id.toString(),
    });
    return (0, response_1.sendSuccess)(res, intent, "Payment intent created");
}
async function paymentWebhook(req, res) {
    const { token, status } = req.body;
    const intent = await PaymentIntent_1.default.findOneAndUpdate({ token }, { status }, { new: true });
    return (0, response_1.sendSuccess)(res, intent, "Payment webhook received");
}
async function listPaymentIntents(_req, res) {
    const intents = await PaymentIntent_1.default.find().sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, intents, "Payments fetched");
}
