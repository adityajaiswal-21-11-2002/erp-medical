"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const localEnv = path_1.default.resolve(process.cwd(), ".env");
const rootEnv = path_1.default.resolve(process.cwd(), "..", ".env");
if (fs_1.default.existsSync(localEnv)) {
    dotenv_1.default.config({ path: localEnv });
}
else if (fs_1.default.existsSync(rootEnv)) {
    dotenv_1.default.config({ path: rootEnv });
}
else {
    dotenv_1.default.config();
}
exports.env = {
    mongoUri: process.env.MONGODB_URI || "",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
    clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    port: Number(process.env.PORT || 5000),
};
if (!exports.env.mongoUri) {
    throw new Error("MONGODB_URI is required");
}
if (!exports.env.jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET (or JWT_SECRET) is required");
}
