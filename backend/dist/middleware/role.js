"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const response_1 = require("../utils/response");
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        }
        if (req.user.role !== role) {
            return (0, response_1.sendError)(res, "Forbidden", 403);
        }
        next();
    };
}
