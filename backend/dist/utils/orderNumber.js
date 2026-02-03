"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = generateOrderNumber;
const crypto_1 = __importDefault(require("crypto"));
function generateOrderNumber(date = new Date()) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = crypto_1.default.randomInt(0, 10000).toString().padStart(4, "0");
    return `ORD-${yyyy}${mm}${dd}-${rand}`;
}
