"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = "OK") {
    return res.json({ success: true, data, message });
}
function sendError(res, error, status = 400) {
    return res.status(status).json({ success: false, error });
}
