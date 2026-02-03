"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const referralAttributionSchema = new mongoose_1.default.Schema({
    refCode: { type: String, required: true },
    retailerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.ReferralAttribution ||
    mongoose_1.default.model("ReferralAttribution", referralAttributionSchema);
