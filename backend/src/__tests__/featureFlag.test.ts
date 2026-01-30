import { requireFeatureFlag } from "../middleware/featureFlag"

const next = jest.fn()
const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any

jest.mock("../models/FeatureFlag", () => ({
  findOne: jest.fn().mockResolvedValue({ key: "RETURNS_ENABLED", enabled: true }),
}))

describe("requireFeatureFlag", () => {
  it("allows when flag enabled", async () => {
    const middleware = requireFeatureFlag("RETURNS_ENABLED")
    await middleware({} as any, res, next)
    expect(next).toHaveBeenCalled()
  })
})
