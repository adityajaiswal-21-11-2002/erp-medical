"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountProfile = getAccountProfile;
exports.updateConsent = updateConsent;
const AccountProfile_1 = __importDefault(require("../models/AccountProfile"));
const response_1 = require("../utils/response");
const complianceService_1 = require("../services/complianceService");
async function getAccountProfile(req, res) {
    const profile = await AccountProfile_1.default.findOne({ userId: req.user?.id });
    return (0, response_1.sendSuccess)(res, profile, "Account profile fetched");
}
async function updateConsent(req, res) {
    const profile = await AccountProfile_1.default.findOneAndUpdate({ userId: req.user?.id }, { consent: req.body.consent }, { new: true, upsert: true });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user?.id,
        action: "CONSENT_UPDATED",
        subjectType: "AccountProfile",
        subjectId: profile._id.toString(),
        metadata: { consent: req.body.consent },
    });
    return (0, response_1.sendSuccess)(res, profile, "Consent updated");
}
