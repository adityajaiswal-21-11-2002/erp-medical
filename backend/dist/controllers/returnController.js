"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReturns = listReturns;
exports.createReturn = createReturn;
exports.updateReturn = updateReturn;
const ReturnRequest_1 = __importDefault(require("../models/ReturnRequest"));
const response_1 = require("../utils/response");
async function listReturns(req, res) {
    const filter = {};
    if (req.user?.accountType !== "ADMIN") {
        filter.retailerId = req.user?.id;
    }
    const returns = await ReturnRequest_1.default.find(filter).sort({ createdAt: -1 });
    return (0, response_1.sendSuccess)(res, returns, "Returns fetched");
}
async function createReturn(req, res) {
    const record = await ReturnRequest_1.default.create({
        orderId: req.body.orderId,
        retailerId: req.user?.id,
        reason: req.body.reason,
        notes: req.body.notes,
    });
    return (0, response_1.sendSuccess)(res, record, "Return request created");
}
async function updateReturn(req, res) {
    const record = await ReturnRequest_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return (0, response_1.sendSuccess)(res, record, "Return request updated");
}
