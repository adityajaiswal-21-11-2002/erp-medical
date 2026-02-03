"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const featureFlagSchema = new mongoose_1.default.Schema({
    key: { type: String, enum: ["RETURNS_ENABLED", "COUPONS_ENABLED"], unique: true },
    enabled: { type: Boolean, default: false },
    updatedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.FeatureFlag || mongoose_1.default.model("FeatureFlag", featureFlagSchema);
