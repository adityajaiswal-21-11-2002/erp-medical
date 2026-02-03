"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const documentSchema = new mongoose_1.default.Schema({
    type: { type: String, required: true },
    label: { type: String },
    filePath: { type: String },
    base64: { type: String },
    metadata: { type: Object },
}, { _id: false });
const kycSubmissionSchema = new mongoose_1.default.Schema({
    retailerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "RESUBMIT"],
        default: "PENDING",
    },
    documents: { type: [documentSchema], default: [] },
    businessName: { type: String, required: true },
    gstin: { type: String },
    drugLicenseNumber: { type: String },
    address: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
exports.default = mongoose_1.default.models.KycSubmission || mongoose_1.default.model("KycSubmission", kycSubmissionSchema);
