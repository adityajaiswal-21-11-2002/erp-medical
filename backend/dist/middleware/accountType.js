"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAccountType = requireAccountType;
const response_1 = require("../utils/response");
function requireAccountType(...types) {
    return (req, res, next) => {
        if (!req.user?.accountType || !types.includes(req.user.accountType)) {
            return (0, response_1.sendError)(res, "Forbidden", 403);
        }
        next();
    };
}
