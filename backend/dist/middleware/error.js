"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Server error";
    res.status(status).json({ success: false, error: message });
}
