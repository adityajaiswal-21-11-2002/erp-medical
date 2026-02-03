"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncProducts = syncProducts;
exports.syncInventory = syncInventory;
exports.pushOrders = pushOrders;
exports.invoiceCallback = invoiceCallback;
exports.shipmentStatus = shipmentStatus;
exports.listInvoices = listInvoices;
const SyncLog_1 = __importDefault(require("../models/SyncLog"));
const response_1 = require("../utils/response");
const erpService_1 = require("../services/erpService");
async function syncProducts(_req, res) {
    const payload = (0, erpService_1.getMockProducts)();
    const log = await SyncLog_1.default.create({
        jobType: "PRODUCTS",
        status: "SUCCESS",
        payload,
        message: "Mock product sync completed",
    });
    return (0, response_1.sendSuccess)(res, { payload, log }, "ERP products synced");
}
async function syncInventory(_req, res) {
    const payload = (0, erpService_1.getMockInventory)();
    const log = await SyncLog_1.default.create({
        jobType: "INVENTORY",
        status: "SUCCESS",
        payload,
        message: "Mock inventory sync completed",
    });
    return (0, response_1.sendSuccess)(res, { payload, log }, "ERP inventory synced");
}
async function pushOrders(req, res) {
    const log = await SyncLog_1.default.create({
        jobType: "ORDERS",
        status: "PENDING",
        payload: req.body,
        message: "Mock order pushed to ERP",
    });
    return (0, response_1.sendSuccess)(res, log, "ERP order queued");
}
async function invoiceCallback(req, res) {
    const log = await SyncLog_1.default.create({
        jobType: "INVOICES",
        status: "SUCCESS",
        payload: req.body,
        message: "Invoice callback received",
    });
    return (0, response_1.sendSuccess)(res, log, "Invoice callback handled");
}
async function shipmentStatus(req, res) {
    const log = await SyncLog_1.default.create({
        jobType: "SHIPMENTS",
        status: "SUCCESS",
        payload: req.body,
        message: "Shipment status updated",
    });
    return (0, response_1.sendSuccess)(res, log, "Shipment status updated");
}
async function listInvoices(_req, res) {
    return (0, response_1.sendSuccess)(res, (0, erpService_1.getMockInvoices)(), "Mock invoices fetched");
}
