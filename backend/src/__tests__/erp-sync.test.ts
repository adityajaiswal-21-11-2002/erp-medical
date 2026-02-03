import express from "express"
import request from "supertest"
import erpRoutes from "../routes/erp"
import syncRoutes from "../routes/sync"

const syncLogCreateMock = jest.fn().mockResolvedValue({
  _id: "log1",
  jobType: "PRODUCTS",
  status: "SUCCESS",
  message: "Mock product sync completed",
})
const syncLogFindMock = jest.fn().mockResolvedValue([])
const syncLogFindByIdAndUpdateMock = jest.fn().mockResolvedValue({
  _id: "log1",
  status: "PENDING",
  retryCount: 1,
})

jest.mock("../models/SyncLog", () => ({
  create: (...args: unknown[]) => syncLogCreateMock(...args),
  find: (...args: unknown[]) => syncLogFindMock(...args),
  findByIdAndUpdate: (...args: unknown[]) => syncLogFindByIdAndUpdateMock(...args),
}))

jest.mock("../models/User", () => ({
  findById: jest.fn().mockResolvedValue({
    _id: "admin1",
    status: "ACTIVE",
    role: "ADMIN",
    email: "admin@demo.com",
    name: "Admin",
  }),
}))

jest.mock("../models/AccountProfile", () => ({
  findOne: jest.fn().mockResolvedValue({ accountType: "ADMIN", userId: "admin1" }),
}))

jest.mock("../utils/token", () => ({
  signAccessToken: jest.fn().mockReturnValue("token"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: "admin1", role: "ADMIN" }),
}))

describe("ERP Sync (stub)", () => {
  const app = express()
  app.use(express.json())
  app.use("/api/erp", erpRoutes)
  app.use("/api/sync", syncRoutes)

  beforeEach(() => {
    jest.clearAllMocks()
    syncLogCreateMock.mockResolvedValue({
      _id: "log1",
      jobType: "PRODUCTS",
      status: "SUCCESS",
      message: "Mock product sync completed",
    })
    syncLogFindByIdAndUpdateMock.mockResolvedValue({
      _id: "log1",
      status: "PENDING",
      retryCount: 1,
    })
  })

  it("sync products returns success and creates SyncLog", async () => {
    const res = await request(app)
      .post("/api/erp/sync/products")
      .set("Authorization", "Bearer token")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.log).toBeDefined()
    expect(syncLogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ jobType: "PRODUCTS", status: "SUCCESS" }),
    )
  })

  it("retry sync updates log state", async () => {
    const res = await request(app)
      .post("/api/sync/retry/log1")
      .set("Authorization", "Bearer token")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(syncLogFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "log1",
      expect.objectContaining({ status: "PENDING" }),
      expect.any(Object),
    )
  })
})
