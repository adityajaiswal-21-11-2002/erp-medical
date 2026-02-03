import express from "express"
import request from "supertest"
import kycRoutes from "../routes/kyc"

const retailerId = "507f1f77bcf86cd799439012"

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({
    _id: "507f1f77bcf86cd799439012",
    status: "ACTIVE",
    role: "USER",
    email: "user@demo.com",
    name: "Retailer",
  }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "RETAILER", userId: "507f1f77bcf86cd799439012" }),
  findOneAndUpdate: jest.fn().mockResolvedValue({ kycStatus: "PENDING" }),
  create: jest.fn().mockResolvedValue({}),
}))

const createKycMock = jest.fn().mockResolvedValue({
  _id: "kyc1",
  retailerId,
  status: "PENDING",
  businessName: "Test Pharmacy",
  gstin: "22AAAAA0000A1Z5",
})
const findOneKycMock = jest.fn().mockReturnValue({
  sort: jest.fn().mockResolvedValue(null),
})
const findKycMock = jest.fn().mockResolvedValue([])
const findByIdKycMock = jest.fn().mockResolvedValue(null)
const saveKycMock = jest.fn().mockResolvedValue(true)

jest.mock("../models/KycSubmission", () => ({
  create: (...args: unknown[]) => createKycMock(...args),
  findOne: (...args: unknown[]) => findOneKycMock(...args),
  find: (...args: unknown[]) => findKycMock(...args),
  findById: (...args: unknown[]) => findByIdKycMock(...args),
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
}))

const logComplianceMock = jest.fn().mockResolvedValue(undefined)
jest.mock("../services/complianceService", () => ({
  logComplianceEvent: (...args: unknown[]) => logComplianceMock(...args),
}))

jest.mock("../utils/token", () => ({
  signAccessToken: jest.fn().mockReturnValue("token"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "507f1f77bcf86cd799439012", role: "USER" }),
}))

describe("KYC", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/kyc", kycRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    require("../utils/token").verifyAccessToken.mockReturnValue({ userId: retailerId, role: "USER" })
  })

  it("retailer can submit KYC", async () => {
    const res = await request(app)
      .post("/api/kyc/submit")
      .set("Authorization", "Bearer token")
      .send({ businessName: "Test Pharmacy", gstin: "22AAAAA0000A1Z5" })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.status).toBe("PENDING")
    expect(createKycMock).toHaveBeenCalled()
    expect(logComplianceMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "KYC_SUBMITTED", subjectType: "KycSubmission" }),
    )
  })

  it("retailer sees KYC status", async () => {
    const AccountProfile = require("../models/AccountProfile")
    AccountProfile.findOne.mockResolvedValue({ kycStatus: "PENDING", userId: retailerId })
    findOneKycMock.mockReturnValue({
      sort: jest.fn().mockResolvedValue({
        _id: "kyc1",
        status: "PENDING",
        businessName: "Test Pharmacy",
      }),
    })

    const res = await request(app).get("/api/kyc/status").set("Authorization", "Bearer token")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.kycStatus).toBe("PENDING")
    expect(res.body.data.submission).toBeDefined()
  })

  it("admin can approve KYC and compliance log recorded", async () => {
    const User = require("../models/User")
    const AccountProfile = require("../models/AccountProfile")
    User.findById.mockResolvedValue({
      _id: "admin1",
      status: "ACTIVE",
      role: "ADMIN",
      email: "admin@demo.com",
      name: "Admin",
    })
    AccountProfile.findOne.mockResolvedValue({ accountType: "ADMIN", userId: "admin1" })
    AccountProfile.findOneAndUpdate.mockResolvedValue({ kycStatus: "APPROVED" })
    require("../utils/token").verifyAccessToken.mockReturnValue({ userId: "admin1", role: "ADMIN" })

    const submissionDoc = {
      _id: "kyc1",
      retailerId,
      status: "PENDING",
      save: jest.fn().mockImplementation(function (this: { status: string }) {
        return Promise.resolve(this)
      }),
    }
    findByIdKycMock.mockResolvedValue(submissionDoc)
    findKycMock.mockResolvedValue([])
    findOneKycMock.mockReturnValue({ sort: jest.fn().mockResolvedValue(submissionDoc) })

    const res = await request(app)
      .patch("/api/kyc/submissions/kyc1")
      .set("Authorization", "Bearer token")
      .send({ status: "APPROVED" })

    expect(res.status).toBe(200)
    expect(submissionDoc.status).toBe("APPROVED")
    expect(logComplianceMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "KYC_REVIEWED", metadata: expect.objectContaining({ status: "APPROVED" }) }),
    )
  })
})
