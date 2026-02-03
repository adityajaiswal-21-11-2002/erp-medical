"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrders = listOrders;
exports.getOrder = getOrder;
exports.createOrderHandler = createOrderHandler;
exports.setOrderStatus = setOrderStatus;
exports.setInvoiceNumber = setInvoiceNumber;
const Order_1 = __importDefault(require("../models/Order"));
const error_1 = require("../middleware/error");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const orderService_1 = require("../services/orderService");
const Referral_1 = __importDefault(require("../models/Referral"));
const ReferralAttribution_1 = __importDefault(require("../models/ReferralAttribution"));
const LoyaltyLedger_1 = __importDefault(require("../models/LoyaltyLedger"));
const AnalyticsEvent_1 = __importDefault(require("../models/AnalyticsEvent"));
async function listOrders(req, res) {
    const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
    const status = String(req.query.status || "").trim();
    const customerName = String(req.query.customerName || "").trim();
    const orderNumber = String(req.query.orderNumber || "").trim();
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : null;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)) : null;
    const filter = {};
    if (status)
        filter.status = status;
    if (customerName)
        filter.customerName = new RegExp(customerName, "i");
    if (orderNumber)
        filter.orderNumber = orderNumber;
    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom)
            filter.createdAt.$gte = dateFrom;
        if (dateTo)
            filter.createdAt.$lte = dateTo;
    }
    if (req.user?.role !== "ADMIN") {
        filter.bookedBy = req.user?.id;
    }
    const [items, total] = await Promise.all([
        Order_1.default.find(filter)
            .populate("bookedBy", "name email")
            .populate("items.product")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Order_1.default.countDocuments(filter),
    ]);
    return (0, response_1.sendSuccess)(res, { items, total, page, limit }, "Orders fetched");
}
async function getOrder(req, res) {
    const order = await Order_1.default.findById(req.params.id)
        .populate("bookedBy", "name email")
        .populate("items.product");
    if (!order) {
        throw new error_1.AppError("Order not found", 404);
    }
    if (req.user?.role !== "ADMIN" && order.bookedBy.toString() !== req.user?.id) {
        throw new error_1.AppError("Forbidden", 403);
    }
    return (0, response_1.sendSuccess)(res, order, "Order fetched");
}
async function createOrderHandler(req, res) {
    const order = await (0, orderService_1.createOrder)({
        userId: req.user.id,
        customerName: req.body.customerName,
        customerMobile: req.body.customerMobile,
        customerAddress: req.body.customerAddress,
        gstin: req.body.gstin,
        doctorName: req.body.doctorName,
        items: req.body.items,
    });
    if (req.body.referralCode) {
        const referral = await Referral_1.default.findOne({ refCode: req.body.referralCode });
        if (referral) {
            await ReferralAttribution_1.default.create({
                refCode: referral.refCode,
                retailerId: referral.retailerId,
                customerId: req.user?.id,
                orderId: order?._id,
            });
            referral.attributedOrders += 1;
            await referral.save();
        }
    }
    if (order) {
        await AnalyticsEvent_1.default.create({
            userId: req.user?.id,
            accountType: req.user?.accountType,
            eventType: "order_placed",
            metadata: { orderId: order._id, netAmount: order.netAmount },
        });
        const points = Math.max(Math.floor((order.netAmount || 0) / 100), 0);
        if (points > 0) {
            await LoyaltyLedger_1.default.create({
                userId: req.user?.id,
                points,
                type: "EARN",
                source: "ORDER",
            });
        }
    }
    return (0, response_1.sendSuccess)(res, order, "Order created");
}
async function setOrderStatus(req, res) {
    const { status } = req.body;
    const order = await (0, orderService_1.updateOrderStatus)(req.params.id, status);
    return (0, response_1.sendSuccess)(res, order, "Order status updated");
}
async function setInvoiceNumber(req, res) {
    const order = await Order_1.default.findByIdAndUpdate(req.params.id, { invoiceNumber: req.body.invoiceNumber }, { new: true });
    if (!order) {
        throw new error_1.AppError("Order not found", 404);
    }
    return (0, response_1.sendSuccess)(res, order, "Invoice updated");
}
