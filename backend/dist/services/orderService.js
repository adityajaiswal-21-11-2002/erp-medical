"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.updateOrderStatus = updateOrderStatus;
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const error_1 = require("../middleware/error");
const orderNumber_1 = require("../utils/orderNumber");
async function createOrder(input) {
    const session = await mongoose_1.default.startSession();
    let createdOrder = null;
    await session.withTransaction(async () => {
        let orderNumber = (0, orderNumber_1.generateOrderNumber)();
        let collision = await Order_1.default.exists({ orderNumber }).session(session);
        let attempts = 0;
        while (collision && attempts < 5) {
            orderNumber = (0, orderNumber_1.generateOrderNumber)();
            collision = await Order_1.default.exists({ orderNumber }).session(session);
            attempts += 1;
        }
        if (collision) {
            throw new error_1.AppError("Could not generate order number", 500);
        }
        let subtotal = 0;
        let totalDiscount = 0;
        let totalGst = 0;
        const orderItems = [];
        for (const item of input.items) {
            const product = await Product_1.default.findById(item.product).session(session);
            if (!product) {
                throw new error_1.AppError("Product not found", 404);
            }
            if (product.currentStock < item.quantity) {
                throw new error_1.AppError(`Insufficient stock for ${product.name}`, 400);
            }
            const rate = item.rate ?? product.ptr ?? product.mrp;
            const mrp = item.mrp ?? product.mrp;
            const lineBase = rate * item.quantity;
            const lineDiscount = item.discount ?? 0;
            const taxable = Math.max(lineBase - lineDiscount, 0);
            const gstRate = (product.gstPercent ?? 0) / 100;
            const gstAmount = taxable * gstRate;
            const cgst = item.cgst ?? gstAmount / 2;
            const sgst = item.sgst ?? gstAmount / 2;
            const amount = item.amount ?? taxable + cgst + sgst;
            subtotal += lineBase;
            totalDiscount += lineDiscount;
            totalGst += cgst + sgst;
            product.currentStock -= item.quantity;
            await product.save({ session });
            orderItems.push({
                product: product._id,
                batch: item.batch,
                expiry: item.expiry,
                quantity: item.quantity,
                freeQuantity: item.freeQuantity ?? 0,
                mrp,
                rate,
                discount: lineDiscount,
                cgst,
                sgst,
                amount,
            });
        }
        const netAmount = Math.max(subtotal - totalDiscount + totalGst, 0);
        createdOrder = await Order_1.default.create([
            {
                orderNumber,
                bookedBy: input.userId,
                customerName: input.customerName,
                customerMobile: input.customerMobile,
                customerAddress: input.customerAddress,
                gstin: input.gstin,
                doctorName: input.doctorName,
                items: orderItems,
                subtotal,
                totalDiscount,
                totalGst,
                netAmount,
                status: "PLACED",
            },
        ], { session });
    });
    session.endSession();
    return createdOrder ? createdOrder[0] : null;
}
async function updateOrderStatus(orderId, status) {
    const session = await mongoose_1.default.startSession();
    let updatedOrder = null;
    await session.withTransaction(async () => {
        const order = await Order_1.default.findById(orderId).session(session);
        if (!order) {
            throw new error_1.AppError("Order not found", 404);
        }
        if (order.status === status) {
            updatedOrder = order;
            return;
        }
        if (status === "CANCELLED") {
            if (order.status !== "PLACED") {
                throw new error_1.AppError("Only placed orders can be cancelled", 400);
            }
            for (const item of order.items) {
                const product = await Product_1.default.findById(item.product).session(session);
                if (product) {
                    product.currentStock += item.quantity;
                    await product.save({ session });
                }
            }
        }
        order.status = status;
        updatedOrder = await order.save({ session });
    });
    session.endSession();
    return updatedOrder;
}
