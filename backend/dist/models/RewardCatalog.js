"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const rewardCatalogSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["SCRATCH_CARD", "MAGIC_STORE"], required: true },
    pointsCost: { type: Number, default: 0 },
    rules: { type: String },
    active: { type: Boolean, default: true },
    metadata: { type: Object },
}, { timestamps: true });
exports.default = mongoose_1.default.models.RewardCatalog ||
    mongoose_1.default.model("RewardCatalog", rewardCatalogSchema);
