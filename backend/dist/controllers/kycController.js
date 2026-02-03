"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitKyc = submitKyc;
exports.getKycStatus = getKycStatus;
exports.listKycSubmissions = listKycSubmissions;
exports.reviewKyc = reviewKyc;
const AccountProfile_1 = __importDefault(require("../models/AccountProfile"));
const KycSubmission_1 = __importDefault(require("../models/KycSubmission"));
const error_1 = require("../middleware/error");
const response_1 = require("../utils/response");
const complianceService_1 = require("../services/complianceService");
async function submitKyc(req, res) {
    if (!req.user) {
        throw new error_1.AppError("Unauthorized", 401);
    }
    const submission = await KycSubmission_1.default.create({
        retailerId: req.user.id,
        status: "PENDING",
        businessName: req.body.businessName,
        gstin: req.body.gstin,
        drugLicenseNumber: req.body.drugLicenseNumber,
        address: req.body.address,
        documents: req.body.documents || [],
    });
    await AccountProfile_1.default.findOneAndUpdate({ userId: req.user.id }, { kycStatus: "PENDING" }, { upsert: true });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user.id,
        action: "KYC_SUBMITTED",
        subjectType: "KycSubmission",
        subjectId: submission._id.toString(),
    });
    return (0, response_1.sendSuccess)(res, submission, "KYC submitted");
}
async function getKycStatus(req, res) {
    if (!req.user) {
        throw new error_1.AppError("Unauthorized", 401);
    }
    const profile = await AccountProfile_1.default.findOne({ userId: req.user.id });
    const latest = await KycSubmission_1.default.findOne({ retailerId: req.user.id }).sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, {
        kycStatus: profile?.kycStatus || "NOT_STARTED",
        submission: latest,
    }, "KYC status fetched");
}
async function listKycSubmissions(_req, res) {
    const items = await KycSubmission_1.default.find().sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, items, "KYC submissions fetched");
}
async function reviewKyc(req, res) {
    const submission = await KycSubmission_1.default.findById(req.params.id);
    if (!submission) {
        throw new error_1.AppError("Submission not found", 404);
    }
    submission.status = req.body.status;
    submission.rejectionReason = req.body.rejectionReason;
    submission.reviewedBy = req.user?.id;
    await submission.save();
    await AccountProfile_1.default.findOneAndUpdate({ userId: submission.retailerId }, { kycStatus: req.body.status === "APPROVED" ? "APPROVED" : "REJECTED" }, { upsert: true });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user?.id,
        action: "KYC_REVIEWED",
        subjectType: "KycSubmission",
        subjectId: submission._id.toString(),
        metadata: { status: req.body.status },
    });
    return (0, response_1.sendSuccess)(res, submission, "KYC reviewed");
}
