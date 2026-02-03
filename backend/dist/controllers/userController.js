"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.resetUserPassword = resetUserPassword;
exports.deleteUser = deleteUser;
const User_1 = __importDefault(require("../models/User"));
const AccountProfile_1 = __importDefault(require("../models/AccountProfile"));
const error_1 = require("../middleware/error");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
async function listUsers(req, res) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const search = String(req.query.search || "").trim();
    const filter = {};
    if (search) {
        filter.$or = [
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { mobile: new RegExp(search, "i") },
        ];
    }
    const [items, total] = await Promise.all([
        User_1.default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-password"),
        User_1.default.countDocuments(filter),
    ]);
    const profiles = await AccountProfile_1.default.find({ userId: { $in: items.map((u) => u._id) } });
    const profileMap = new Map(profiles.map((profile) => [profile.userId.toString(), profile]));
    const enriched = items.map((user) => {
        const profile = profileMap.get(user._id.toString());
        return {
            ...user.toObject(),
            accountType: profile?.accountType,
            kycStatus: profile?.kycStatus,
            profileStatus: profile?.status,
        };
    });
    return (0, response_1.sendSuccess)(res, { items: enriched, total, page, limit }, "Users fetched");
}
async function createUser(req, res) {
    const { name, email, password, mobile, role, accountType } = req.body;
    const user = await User_1.default.create({
        name,
        email,
        password,
        mobile,
        role,
        createdBy: req.user?.id,
    });
    const resolvedAccountType = accountType || (role === "ADMIN" ? "ADMIN" : "RETAILER");
    await AccountProfile_1.default.create({
        userId: user._id,
        accountType: resolvedAccountType,
    });
    return (0, response_1.sendSuccess)(res, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountType: resolvedAccountType,
    }, "User created");
}
async function updateUser(req, res) {
    const { id } = req.params;
    const updates = {};
    const { name, mobile, status, role, accountType, profileStatus } = req.body;
    if (name !== undefined)
        updates.name = name;
    if (mobile !== undefined)
        updates.mobile = mobile;
    if (status !== undefined)
        updates.status = status;
    if (role !== undefined)
        updates.role = role;
    const user = await User_1.default.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    if (!user) {
        throw new error_1.AppError("User not found", 404);
    }
    if (accountType || profileStatus) {
        await AccountProfile_1.default.findOneAndUpdate({ userId: id }, {
            ...(accountType ? { accountType } : {}),
            ...(profileStatus ? { status: profileStatus } : {}),
        }, { upsert: true });
    }
    return (0, response_1.sendSuccess)(res, user, "User updated");
}
async function resetUserPassword(req, res) {
    const { id } = req.params;
    const { password } = req.body;
    const user = await User_1.default.findById(id);
    if (!user) {
        throw new error_1.AppError("User not found", 404);
    }
    user.password = password;
    await user.save();
    return (0, response_1.sendSuccess)(res, null, "Password reset");
}
async function deleteUser(req, res) {
    const { id } = req.params;
    const user = await User_1.default.findByIdAndUpdate(id, { status: "BLOCKED" }, { new: true }).select("-password");
    if (!user) {
        throw new error_1.AppError("User not found", 404);
    }
    return (0, response_1.sendSuccess)(res, user, "User blocked");
}
