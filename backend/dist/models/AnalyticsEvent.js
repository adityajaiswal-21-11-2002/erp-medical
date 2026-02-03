"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const analyticsEventSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    accountType: { type: String },
    eventType: {
        type: String,
        enum: ["page_view", "search", "add_to_cart", "checkout", "order_placed", "login"],
        required: true,
    },
    metadata: { type: Object },
}, { timestamps: true });
exports.default = mongoose_1.default.models.AnalyticsEvent ||
    mongoose_1.default.model("AnalyticsEvent", analyticsEventSchema);
