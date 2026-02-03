"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bannerAssetSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    base64: { type: String },
    placement: { type: String, enum: ["ADMIN", "RETAILER", "CUSTOMER"], default: "CUSTOMER" },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.BannerAsset || mongoose_1.default.model("BannerAsset", bannerAssetSchema);
