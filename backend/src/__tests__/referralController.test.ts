import { attributeReferral, getReferral } from "../controllers/referralController"

const saveMock = jest.fn()

const findOneReferralMock = jest.fn().mockResolvedValue({
  retailerId: "ret1",
  refCode: "REF-123",
  attributedOrders: 0,
  save: saveMock,
})
const createAttributionMock = jest.fn().mockResolvedValue({ _id: "attr1" })
const findOneAttributionMock = jest.fn().mockResolvedValue(null)

jest.mock("../models/Referral", () => ({
  findOne: (...args: unknown[]) => findOneReferralMock(...args),
  create: jest.fn().mockResolvedValue({
    retailerId: "ret1",
    refCode: "REF-DEMO1",
    attributedOrders: 0,
  }),
}))

jest.mock("../models/ReferralAttribution", () => ({
  create: (...args: unknown[]) => createAttributionMock(...args),
  findOne: (...args: unknown[]) => findOneAttributionMock(...args),
}))

describe("referralController", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    findOneReferralMock.mockResolvedValue({
      retailerId: "ret1",
      refCode: "REF-123",
      attributedOrders: 0,
      save: saveMock,
    })
    findOneAttributionMock.mockResolvedValue(null)
  })

  describe("getReferral", () => {
    it("creates referral code for retailer when none exists", async () => {
      const Referral = require("../models/Referral")
      findOneReferralMock.mockResolvedValue(null)
      Referral.create.mockResolvedValue({
        retailerId: "ret1",
        refCode: "REF-NEW",
        attributedOrders: 0,
      })

      const req = { user: { id: "ret1" } } as any
      const res = { json: jest.fn() } as any
      await getReferral(req, res)
      expect(Referral.create).toHaveBeenCalledWith(
        expect.objectContaining({ retailerId: "ret1" }),
      )
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ refCode: "REF-NEW" }),
        }),
      )
    })
  })

  describe("attributeReferral", () => {
    it("customer order with ref attributes to retailer", async () => {
      const req = { body: { refCode: "REF-123", orderId: "order1", customerId: "cust1" } } as any
      const res = { json: jest.fn() } as any
      await attributeReferral(req, res)
      expect(saveMock).toHaveBeenCalled()
      expect(createAttributionMock).toHaveBeenCalledWith({
        refCode: "REF-123",
        retailerId: "ret1",
        orderId: "order1",
        customerId: "cust1",
      })
    })

    it("invalid ref code returns success but no attribution created", async () => {
      findOneReferralMock.mockResolvedValue(null)

      const req = { body: { refCode: "REF-INVALID", orderId: "order1", customerId: "cust1" } } as any
      const res = { json: jest.fn() } as any
      await attributeReferral(req, res)
      expect(createAttributionMock).not.toHaveBeenCalled()
      expect(saveMock).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: null,
        }),
      )
    })

    it("retailer loyalty points (attributedOrders) credited exactly once - duplicate attribute does not double-increment", async () => {
      const referralDoc = {
        retailerId: "ret1",
        refCode: "REF-123",
        attributedOrders: 0,
        save: saveMock,
      }
      findOneReferralMock.mockResolvedValue(referralDoc)
      findOneAttributionMock.mockResolvedValueOnce(null).mockResolvedValue({ _id: "attr1" })

      const req1 = { body: { refCode: "REF-123", orderId: "order1", customerId: "cust1" } } as any
      const res1 = { json: jest.fn() } as any
      await attributeReferral(req1, res1)
      expect(referralDoc.attributedOrders).toBe(1)
      expect(saveMock).toHaveBeenCalledTimes(1)

      const req2 = { body: { refCode: "REF-123", orderId: "order1", customerId: "cust1" } } as any
      const res2 = { json: jest.fn() } as any
      await attributeReferral(req2, res2)
      expect(referralDoc.attributedOrders).toBe(1)
      expect(createAttributionMock).toHaveBeenCalledTimes(1)
    })
  })
})
