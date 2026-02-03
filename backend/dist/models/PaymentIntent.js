"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentIntentSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    token: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    provider: { type: String, default: "MOCK_ROUTER" },
    metadata: { type: Object },
}, { timestamps: true });
exports.default = mongoose_1.default.models.PaymentIntent ||
    mongoose_1.default.model("PaymentIntent", paymentIntentSchema);
