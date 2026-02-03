"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDistributorOrders = listDistributorOrders;
exports.updateDistributorOrder = updateDistributorOrder;
exports.listInventoryAllocation = listInventoryAllocation;
exports.listSettlements = listSettlements;
const Order_1 = __importDefault(require("../models/Order"));
const OrderWorkflow_1 = __importDefault(require("../models/OrderWorkflow"));
const response_1 = require("../utils/response");
const erpService_1 = require("../services/erpService");
async function listDistributorOrders(_req, res) {
    const orders = await Order_1.default.find().sort({ createdAt: -1 }).limit(200);
    const workflows = await OrderWorkflow_1.default.find({ orderId: { $in: orders.map((o) => o._id) } });
    const workflowMap = new Map(workflows.map((wf) => [wf.orderId.toString(), wf]));
    const enriched = orders.map((order) => ({
        ...order.toObject(),
        workflow: workflowMap.get(order._id.toString()) || { distributorStatus: "PENDING_APPROVAL" },
    }));
    return (0, response_1.sendSuccess)(res, enriched, "Distributor orders fetched");
}
async function updateDistributorOrder(req, res) {
    const workflow = await OrderWorkflow_1.default.findOneAndUpdate({ orderId: req.params.id }, { distributorStatus: req.body.distributorStatus, notes: req.body.notes }, { new: true, upsert: true });
    return (0, response_1.sendSuccess)(res, workflow, "Distributor order updated");
}
async function listInventoryAllocation(_req, res) {
    const allocations = [
        { sku: "SWIL-PARA-500", allocated: 120, available: 200 },
        { sku: "SWIL-AZI-250", allocated: 50, available: 120 },
    ];
    return (0, response_1.sendSuccess)(res, allocations, "Inventory allocation fetched");
}
async function listSettlements(_req, res) {
    return (0, response_1.sendSuccess)(res, (0, erpService_1.getMockSettlements)(), "Settlements fetched");
}
