"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const syncLogSchema = new mongoose_1.default.Schema({
    jobType: {
        type: String,
        enum: ["PRODUCTS", "INVENTORY", "ORDERS", "INVOICES", "SHIPMENTS"],
        required: true,
    },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
    message: { type: String },
    payload: { type: Object },
    retryCount: { type: Number, default: 0 },
    nextRetryAt: { type: Date },
}, { timestamps: true });
exports.default = mongoose_1.default.models.SyncLog || mongoose_1.default.model("SyncLog", syncLogSchema);
