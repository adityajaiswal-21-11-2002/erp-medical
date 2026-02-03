"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFeatureFlag = requireFeatureFlag;
const FeatureFlag_1 = __importDefault(require("../models/FeatureFlag"));
const response_1 = require("../utils/response");
function requireFeatureFlag(flag) {
    return async (_req, res, next) => {
        const doc = await FeatureFlag_1.default.findOne({ key: flag });
        if (!doc || !doc.enabled) {
            return (0, response_1.sendError)(res, `${flag} is disabled`, 403);
        }
        next();
    };
}
