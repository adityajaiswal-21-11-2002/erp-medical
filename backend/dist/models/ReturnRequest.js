"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const returnRequestSchema = new mongoose_1.default.Schema({
    orderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order", required: true },
    retailerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["REQUESTED", "APPROVED", "REJECTED"], default: "REQUESTED" },
    notes: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.models.ReturnRequest ||
    mongoose_1.default.model("ReturnRequest", returnRequestSchema);
