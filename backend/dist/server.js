"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const account_1 = __importDefault(require("./routes/account"));
const kyc_1 = __importDefault(require("./routes/kyc"));
const featureFlags_1 = __importDefault(require("./routes/featureFlags"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
const rewards_1 = __importDefault(require("./routes/rewards"));
const referrals_1 = __importDefault(require("./routes/referrals"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const erp_1 = __importDefault(require("./routes/erp"));
const sync_1 = __importDefault(require("./routes/sync"));
const compliance_1 = __importDefault(require("./routes/compliance"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const banners_1 = __importDefault(require("./routes/banners"));
const payments_1 = __importDefault(require("./routes/payments"));
const returns_1 = __importDefault(require("./routes/returns"));
const coupons_1 = __importDefault(require("./routes/coupons"));
const distributor_1 = __importDefault(require("./routes/distributor"));
const error_1 = require("./middleware/error");
const swagger_1 = require("./swagger");
const response_1 = require("./utils/response");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.clientOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    limit: 300,
}));
function getDbStatus() {
    const state = mongoose_1.default.connection.readyState;
    if (state === 1)
        return "connected";
    if (state === 2)
        return "connecting";
    if (state === 3)
        return "disconnecting";
    return "disconnected";
}
app.get("/api/health", (_req, res) => (0, response_1.sendSuccess)(res, { status: "ok", db: getDbStatus() }, "Healthy"));
app.get("/health", (_req, res) => (0, response_1.sendSuccess)(res, { status: "ok", db: getDbStatus() }, "Healthy"));
app.use("/api/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/products", products_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/account", account_1.default);
app.use("/api/kyc", kyc_1.default);
app.use("/api/feature-flags", featureFlags_1.default);
app.use("/api/loyalty", loyalty_1.default);
app.use("/api/rewards", rewards_1.default);
app.use("/api/referrals", referrals_1.default);
app.use("/api/analytics", analytics_1.default);
app.use("/api/erp", erp_1.default);
app.use("/api/sync", sync_1.default);
app.use("/api/compliance", compliance_1.default);
app.use("/api/tickets", tickets_1.default);
app.use("/api/banners", banners_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/returns", returns_1.default);
app.use("/api/coupons", coupons_1.default);
app.use("/api/distributor", distributor_1.default);
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(error_1.errorHandler);
(0, db_1.connectDb)()
    .then(() => {
    app.listen(env_1.env.port, () => {
        console.log(`API running on port ${env_1.env.port}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
});
