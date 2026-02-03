"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logComplianceEvent = logComplianceEvent;
const ComplianceLog_1 = __importDefault(require("../models/ComplianceLog"));
async function logComplianceEvent(input) {
    return ComplianceLog_1.default.create({
        actorId: input.actorId,
        action: input.action,
        subjectType: input.subjectType,
        subjectId: input.subjectId,
        metadata: input.metadata,
    });
}
