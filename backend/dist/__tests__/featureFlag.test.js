"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const featureFlag_1 = require("../middleware/featureFlag");
const next = jest.fn();
const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
jest.mock("../models/FeatureFlag", () => ({
    findOne: jest.fn().mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true }),
}));
describe("requireFeatureFlag", () => {
    it("allows when flag enabled", async () => {
        const middleware = (0, featureFlag_1.requireFeatureFlag)("RETURNS_ENABLED");
        await middleware({}, res, next);
        expect(next).toHaveBeenCalled();
    });
});
