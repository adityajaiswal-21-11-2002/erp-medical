"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    // Base64-encoded user photo (avatar)
    photoBase64: { type: String },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    lastLogin: Date,
}, { timestamps: true });
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
