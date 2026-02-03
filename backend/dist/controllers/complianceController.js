"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listComplianceLogs = listComplianceLogs;
const ComplianceLog_1 = __importDefault(require("../models/ComplianceLog"));
const response_1 = require("../utils/response");
async function listComplianceLogs(_req, res) {
    const logs = await ComplianceLog_1.default.find().sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, logs, "Compliance logs fetched");
}
