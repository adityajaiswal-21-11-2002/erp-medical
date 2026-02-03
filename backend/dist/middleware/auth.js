"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const User_1 = __importDefault(require("../models/User"));
const AccountProfile_1 = __importDefault(require("../models/AccountProfile"));
const token_1 = require("../utils/token");
const response_1 = require("../utils/response");
async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : "";
        if (!token) {
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        }
        const payload = (0, token_1.verifyAccessToken)(token);
        const user = await User_1.default.findById(payload.userId);
        if (!user) {
            return (0, response_1.sendError)(res, "Unauthorized", 401);
        }
        if (user.status === "BLOCKED") {
            return (0, response_1.sendError)(res, "User is blocked", 403);
        }
        const profile = await AccountProfile_1.default.findOne({ userId: user._id });
        req.user = {
            id: user._id.toString(),
            role: user.role,
            email: user.email,
            name: user.name,
            status: user.status,
            accountType: profile?.accountType,
        };
        next();
    }
    catch {
        return (0, response_1.sendError)(res, "Unauthorized", 401);
    }
}
async function optionalAuth(req, _res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : "";
        if (!token) {
            return next();
        }
        const payload = (0, token_1.verifyAccessToken)(token);
        const user = await User_1.default.findById(payload.userId);
        if (user && user.status !== "BLOCKED") {
            const profile = await AccountProfile_1.default.findOne({ userId: user._id });
            req.user = {
                id: user._id.toString(),
                role: user.role,
                email: user.email,
                name: user.name,
                status: user.status,
                accountType: profile?.accountType,
            };
        }
    }
    catch {
        // ignore invalid token for optional auth
    }
    next();
}
