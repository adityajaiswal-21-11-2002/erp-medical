"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const loyaltyLedgerSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ["EARN", "REDEEM", "ADJUST"], required: true },
    source: { type: String },
    tier: { type: String, enum: ["BRONZE", "SILVER", "GOLD"], default: "BRONZE" },
    metadata: { type: Object },
}, { timestamps: true });
exports.default = mongoose_1.default.models.LoyaltyLedger ||
    mongoose_1.default.model("LoyaltyLedger", loyaltyLedgerSchema);
