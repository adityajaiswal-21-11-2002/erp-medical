"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ticketSchema = new mongoose_1.default.Schema({
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    accountType: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], default: "OPEN" },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    assignedTo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.Ticket || mongoose_1.default.model("Ticket", ticketSchema);
