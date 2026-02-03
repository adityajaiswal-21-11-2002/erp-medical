"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const consentSchema = new mongoose_1.default.Schema({
    dpdpAccepted: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    ipAddress: { type: String },
    source: { type: String },
}, { _id: false });
const accountProfileSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    accountType: {
        type: String,
        enum: ["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"],
        required: true,
    },
    kycStatus: {
        type: String,
        enum: ["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"],
        default: "NOT_STARTED",
    },
    distributorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    consent: { type: consentSchema, default: () => ({}) },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.AccountProfile ||
    mongoose_1.default.model("AccountProfile", accountProfileSchema);
