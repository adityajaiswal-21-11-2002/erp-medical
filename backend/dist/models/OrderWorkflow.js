"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderWorkflowSchema = new mongoose_1.default.Schema({
    orderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    distributorStatus: {
        type: String,
        enum: ["PENDING_APPROVAL", "APPROVED", "CONSOLIDATED", "ALLOCATED", "SHIPPED"],
        default: "PENDING_APPROVAL",
    },
    notes: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.models.OrderWorkflow ||
    mongoose_1.default.model("OrderWorkflow", orderWorkflowSchema);
