"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const couponSchema = new mongoose_1.default.Schema({
    code: { type: String, unique: true, required: true },
    description: { type: String },
    discountPercent: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Coupon || mongoose_1.default.model("Coupon", couponSchema);
