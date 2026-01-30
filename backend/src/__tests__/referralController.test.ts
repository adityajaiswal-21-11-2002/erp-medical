import { attributeReferral } from "../controllers/referralController"

const saveMock = jest.fn()

jest.mock("../models/Referral", () => ({
  findOne: jest.fn().mockResolvedValue({
    retailerId: "ret1",
    refCode: "REF-123",
    attributedOrders: 0,
    save: saveMock,
  }),
}))

jest.mock("../models/ReferralAttribution", () => ({
  create: jest.fn().mockResolvedValue({ _id: "attr1" }),
}))

describe("referralController.attributeReferral", () => {
  it("increments attributed orders", async () => {
    const req = { body: { refCode: "REF-123", orderId: "order1", customerId: "cust1" } } as any
    const res = { json: jest.fn() } as any
    await attributeReferral(req, res)
    expect(saveMock).toHaveBeenCalled()
  })
})
