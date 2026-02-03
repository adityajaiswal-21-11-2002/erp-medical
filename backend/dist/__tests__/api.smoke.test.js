"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const auth_1 = __importDefault(require("../routes/auth"));
const products_1 = __importDefault(require("../routes/products"));
const orders_1 = __importDefault(require("../routes/orders"));
const kyc_1 = __importDefault(require("../routes/kyc"));
jest.mock("../models/User", () => ({
    countDocuments: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({
        _id: "user1",
        name: "Admin",
        email: "admin@demo.com",
        role: "ADMIN",
    }),
    findOne: jest.fn().mockResolvedValue({
        _id: "user1",
        name: "Admin",
        email: "admin@demo.com",
        status: "ACTIVE",
        role: "ADMIN",
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
    }),
    findById: jest.fn().mockResolvedValue({
        _id: "user1",
        name: "Admin",
        email: "admin@demo.com",
        status: "ACTIVE",
        role: "ADMIN",
    }),
}));
jest.mock("../models/AccountProfile", () => ({
    findOne: jest.fn().mockResolvedValue({ accountType: "ADMIN", kycStatus: "APPROVED" }),
    create: jest.fn().mockResolvedValue({ accountType: "ADMIN" }),
    findOneAndUpdate: jest.fn().mockResolvedValue({ accountType: "ADMIN" }),
}));
jest.mock("../models/Product", () => ({
    find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
    }),
    countDocuments: jest.fn().mockResolvedValue(0),
}));
jest.mock("../services/orderService", () => ({
    createOrder: jest.fn().mockResolvedValue({ _id: "order1" }),
    updateOrderStatus: jest.fn().mockResolvedValue({ _id: "order1" }),
}));
jest.mock("../models/KycSubmission", () => ({
    create: jest.fn().mockResolvedValue({ _id: "kyc1", status: "PENDING" }),
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
}));
jest.mock("../middleware/auth", () => ({
    requireAuth: (req, _res, next) => {
        req.user = { id: "user1", role: "ADMIN", email: "admin@demo.com", name: "Admin", status: "ACTIVE", accountType: "ADMIN" };
        next();
    },
    optionalAuth: (req, _res, next) => {
        req.user = { id: "user1", role: "ADMIN", email: "admin@demo.com", name: "Admin", status: "ACTIVE", accountType: "ADMIN" };
        next();
    },
}));
jest.mock("../utils/token", () => ({
    signAccessToken: jest.fn().mockReturnValue("token"),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: "user1", role: "ADMIN" }),
}));
describe("API smoke tests", () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use("/api/auth", auth_1.default);
    app.use("/api/products", products_1.default);
    app.use("/api/orders", orders_1.default);
    app.use("/api/kyc", kyc_1.default);
    it("registers a user", async () => {
        const res = await (0, supertest_1.default)(app).post("/api/auth/register").send({
            name: "Admin",
            email: "admin@demo.com",
            password: "Admin@123",
            mobile: "9999999999",
            role: "ADMIN",
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    it("lists products", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/products");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    it("creates an order", async () => {
        const res = await (0, supertest_1.default)(app).post("/api/orders").send({
            customerName: "Test Customer",
            customerMobile: "9999999999",
            customerAddress: "Test Address",
            items: [{ product: "prod1", quantity: 1 }],
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
    it("submits KYC", async () => {
        const res = await (0, supertest_1.default)(app).post("/api/kyc/submit").send({
            businessName: "Test Pharmacy",
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
