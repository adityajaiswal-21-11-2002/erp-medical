"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFlags = listFlags;
exports.updateFlag = updateFlag;
const FeatureFlag_1 = __importDefault(require("../models/FeatureFlag"));
const response_1 = require("../utils/response");
const complianceService_1 = require("../services/complianceService");
async function listFlags(_req, res) {
    const flags = await FeatureFlag_1.default.find();
    return (0, response_1.sendSuccess)(res, flags, "Feature flags fetched");
}
async function updateFlag(req, res) {
    const { key } = req.params;
    const { enabled } = req.body;
    const flag = await FeatureFlag_1.default.findOneAndUpdate({ key }, { enabled, updatedBy: req.user?.id }, { upsert: true, new: true });
    await (0, complianceService_1.logComplianceEvent)({
        actorId: req.user?.id,
        action: "FEATURE_FLAG_UPDATED",
        subjectType: "FeatureFlag",
        subjectId: flag._id.toString(),
        metadata: { key, enabled },
    });
    return (0, response_1.sendSuccess)(res, flag, "Feature flag updated");
}
