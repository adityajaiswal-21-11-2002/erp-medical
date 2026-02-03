"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSyncLogs = listSyncLogs;
exports.retrySync = retrySync;
const SyncLog_1 = __importDefault(require("../models/SyncLog"));
const response_1 = require("../utils/response");
async function listSyncLogs(_req, res) {
    const logs = await SyncLog_1.default.find().sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, logs, "Sync logs fetched");
}
async function retrySync(req, res) {
    const log = await SyncLog_1.default.findByIdAndUpdate(req.params.id, { status: "PENDING", retryCount: { $inc: 1 }, nextRetryAt: new Date() }, { new: true });
    return (0, response_1.sendSuccess)(res, log, "Sync retry queued");
}
