"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderService_1 = require("../services/orderService");
jest.mock("mongoose", () => ({
    startSession: jest.fn().mockResolvedValue({
        withTransaction: async (fn) => {
            await fn();
        },
        endSession: jest.fn(),
    }),
}));
const saveMock = jest.fn();
const productMock = { currentStock: 5, save: saveMock };
jest.mock("../models/Product", () => ({
    findById: jest.fn().mockResolvedValue(productMock),
}));
const orderSaveMock = jest.fn().mockResolvedValue({ _id: "order1", status: "CANCELLED" });
const orderMock = {
    _id: "order1",
    status: "PLACED",
    items: [{ product: "prod1", quantity: 2 }],
    save: orderSaveMock,
};
jest.mock("../models/Order", () => ({
    findById: jest.fn().mockResolvedValue(orderMock),
}));
describe("orderService.updateOrderStatus", () => {
    it("restocks items when cancelling", async () => {
        const result = await (0, orderService_1.updateOrderStatus)("order1", "CANCELLED");
        expect(result).toBeTruthy();
        expect(productMock.currentStock).toBe(7);
        expect(saveMock).toHaveBeenCalled();
    });
});
