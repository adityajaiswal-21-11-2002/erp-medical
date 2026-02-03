"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCoupons = listCoupons;
exports.createCoupon = createCoupon;
const Coupon_1 = __importDefault(require("../models/Coupon"));
const response_1 = require("../utils/response");
async function listCoupons(_req, res) {
    const coupons = await Coupon_1.default.find({ active: true }).sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, coupons, "Coupons fetched");
}
async function createCoupon(req, res) {
    const coupon = await Coupon_1.default.create(req.body);
    return (0, response_1.sendSuccess)(res, coupon, "Coupon created");
}
