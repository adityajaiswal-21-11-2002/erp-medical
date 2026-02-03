import { createOrder, updateOrderStatus } from "../services/orderService"

jest.mock("mongoose", () => ({
  startSession: jest.fn().mockResolvedValue({
    withTransaction: async (fn: (arg: unknown) => Promise<void>) => {
      await fn(undefined)
    },
    endSession: jest.fn(),
  }),
}))

jest.mock("../utils/orderNumber", () => ({
  generateOrderNumber: jest.fn().mockReturnValue("ORD-20260203-0001"),
}))

const saveMock = jest.fn()
const productMock = { _id: "prod1", currentStock: 10, ptr: 28, mrp: 35, gstPercent: 5, name: "Prod", save: saveMock }

function mockExists(res: boolean) {
  return jest.fn().mockReturnValue({ session: () => Promise.resolve(res) })
}
function mockCreate(res: unknown[]) {
  return jest.fn().mockResolvedValue(res)
}

jest.mock("../models/Product", () => ({
  findById: jest.fn(),
}))

jest.mock("../models/Order", () => ({
  findById: jest.fn(),
  exists: mockExists(false),
  create: mockCreate([{ _id: "order1", netAmount: 100 }]),
}))

const Product = require("../models/Product")
const Order = require("../models/Order")

describe("orderService.createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    productMock.currentStock = 10
    Product.findById.mockReturnValue({
      session: () => Promise.resolve(productMock),
    })
    Order.exists.mockReturnValue({ session: () => Promise.resolve(false) })
    Order.create.mockResolvedValue([{ _id: "order1", netAmount: 100 }])
  })

  it("create order reduces Product.currentStock", async () => {
    const result = await createOrder({
      userId: "user1",
      customerName: "C",
      customerMobile: "9999999999",
      customerAddress: "Addr",
      items: [{ product: "prod1", quantity: 3 }],
    })
    expect(result).toBeTruthy()
    expect(productMock.currentStock).toBe(7)
    expect(saveMock).toHaveBeenCalled()
  })

  it("cannot create order if stock insufficient", async () => {
    productMock.currentStock = 2
    Product.findById.mockReturnValue({
      session: () => Promise.resolve(productMock),
    })

    await expect(
      createOrder({
        userId: "user1",
        customerName: "C",
        customerMobile: "9999999999",
        customerAddress: "Addr",
        items: [{ product: "prod1", quantity: 5 }],
      }),
    ).rejects.toThrow(/Insufficient stock/i)
    expect(productMock.currentStock).toBe(2)
  })
})

const orderSaveMock = jest.fn().mockImplementation(function (this: { status: string }) {
  return Promise.resolve(this)
})
const orderMock = {
  _id: "order1",
  status: "PLACED",
  items: [{ product: "prod1", quantity: 2 }],
  save: orderSaveMock,
}

describe("orderService.updateOrderStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    productMock.currentStock = 5
    orderMock.status = "PLACED"
    Order.findById.mockReturnValue({
      session: () => Promise.resolve(orderMock),
    })
    Product.findById.mockReturnValue({
      session: () => Promise.resolve(productMock),
    })
  })

  it("restocks items when cancelling", async () => {
    const result = await updateOrderStatus("order1", "CANCELLED")
    expect(result).toBeTruthy()
    expect(productMock.currentStock).toBe(7)
    expect(saveMock).toHaveBeenCalled()
  })

  it("duplicate cancel does not double-restore", async () => {
    await updateOrderStatus("order1", "CANCELLED")
    expect(productMock.currentStock).toBe(7)
    const saveCallsAfterFirst = saveMock.mock.calls.length

    orderMock.status = "CANCELLED"
    await updateOrderStatus("order1", "CANCELLED")

    expect(productMock.currentStock).toBe(7)
    expect(saveMock.mock.calls.length).toBe(saveCallsAfterFirst)
  })
})
