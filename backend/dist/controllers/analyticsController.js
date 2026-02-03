"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestEvent = ingestEvent;
exports.getAnalyticsSummary = getAnalyticsSummary;
const AnalyticsEvent_1 = __importDefault(require("../models/AnalyticsEvent"));
const response_1 = require("../utils/response");
async function ingestEvent(req, res) {
    const event = await AnalyticsEvent_1.default.create({
        userId: req.user?.id,
        accountType: req.user?.accountType,
        eventType: req.body.eventType,
        metadata: req.body.metadata || {},
    });
    return (0, response_1.sendSuccess)(res, event, "Event recorded");
}
async function getAnalyticsSummary(_req, res) {
    const totals = await AnalyticsEvent_1.default.aggregate([
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]);
    const byEvent = totals.reduce((acc, row) => {
        acc[row._id] = row.count;
        return acc;
    }, {});
    const topSearches = await AnalyticsEvent_1.default.aggregate([
        { $match: { eventType: "search" } },
        { $group: { _id: "$metadata.query", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);
    return (0, response_1.sendSuccess)(res, { totals: byEvent, topSearches }, "Analytics summary fetched");
}
