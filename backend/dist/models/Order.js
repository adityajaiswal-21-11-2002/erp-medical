"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    orderNumber: { type: String, unique: true, required: true },
    bookedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerAddress: { type: String, required: true },
    gstin: String,
    doctorName: String,
    items: [
        {
            product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Product", required: true },
            batch: String,
            expiry: String,
            quantity: { type: Number, required: true },
            freeQuantity: { type: Number, default: 0 },
            mrp: Number,
            rate: Number,
            discount: Number,
            cgst: Number,
            sgst: Number,
            amount: Number,
        },
    ],
    subtotal: Number,
    totalDiscount: Number,
    totalGst: Number,
    netAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["PLACED", "CANCELLED", "DELIVERED"],
        default: "PLACED",
    },
    invoiceNumber: String,
}, { timestamps: true });
exports.default = mongoose_1.default.models.Order || mongoose_1.default.model("Order", orderSchema);
