"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const referralSchema = new mongoose_1.default.Schema({
    refCode: { type: String, unique: true, required: true },
    retailerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    clicks: { type: Number, default: 0 },
    attributedOrders: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Referral || mongoose_1.default.model("Referral", referralSchema);
