"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.me = me;
const User_1 = __importDefault(require("../models/User"));
const AccountProfile_1 = __importDefault(require("../models/AccountProfile"));
const error_1 = require("../middleware/error");
const response_1 = require("../utils/response");
const token_1 = require("../utils/token");
async function register(req, res) {
    const existingCount = await User_1.default.countDocuments();
    if (existingCount > 0) {
        if (!req.user || req.user.role !== "ADMIN") {
            throw new error_1.AppError("Only admin can create users", 403);
        }
    }
    const { name, email, password, mobile, role, accountType, consent } = req.body;
    const user = await User_1.default.create({
        name,
        email,
        password,
        mobile,
        role: existingCount === 0 ? "ADMIN" : role || "USER",
        createdBy: req.user?.id,
    });
    const resolvedAccountType = existingCount === 0
        ? "ADMIN"
        : accountType ||
            (user.role === "ADMIN" ? "ADMIN" : "RETAILER");
    await AccountProfile_1.default.create({
        userId: user._id,
        accountType: resolvedAccountType,
        consent: consent || {},
    });
    return (0, response_1.sendSuccess)(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: resolvedAccountType,
    }, "User registered");
}
async function login(req, res) {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        throw new error_1.AppError("Invalid credentials", 401);
    }
    if (user.status === "BLOCKED") {
        throw new error_1.AppError("User is blocked", 403);
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
        throw new error_1.AppError("Invalid credentials", 401);
    }
    user.lastLogin = new Date();
    await user.save();
    let profile = await AccountProfile_1.default.findOne({ userId: user._id });
    if (!profile) {
        profile = await AccountProfile_1.default.create({
            userId: user._id,
            accountType: user.role === "ADMIN" ? "ADMIN" : "RETAILER",
        });
    }
    const token = (0, token_1.signAccessToken)({ userId: user._id.toString(), role: user.role });
    return (0, response_1.sendSuccess)(res, {
        accessToken: token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: profile.accountType,
            kycStatus: profile.kycStatus,
        },
    }, "Login successful");
}
async function logout(_req, res) {
    return (0, response_1.sendSuccess)(res, null, "Logged out");
}
async function me(req, res) {
    if (!req.user) {
        throw new error_1.AppError("Unauthorized", 401);
    }
    const profile = await AccountProfile_1.default.findOne({ userId: req.user.id });
    return (0, response_1.sendSuccess)(res, {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        accountType: profile?.accountType,
        kycStatus: profile?.kycStatus,
        consent: profile?.consent,
    }, "Profile fetched");
}
