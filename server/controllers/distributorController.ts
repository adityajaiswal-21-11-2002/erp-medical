import { Request, Response } from "express"
import Order from "../models/Order"
import OrderWorkflow from "../models/OrderWorkflow"
import { sendSuccess } from "../utils/response"
import { getMockSettlements } from "../services/erpService"

export async function listDistributorOrders(_req: Request, res: Response) {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200)
  const workflows = await OrderWorkflow.find({ orderId: { $in: orders.map((o) => o._id) } })
  const workflowMap = new Map(workflows.map((wf) => [wf.orderId.toString(), wf]))
  const enriched = orders.map((order) => ({
    ...order.toObject(),
    workflow: workflowMap.get(order._id.toString()) || { distributorStatus: "PENDING_APPROVAL" },
  }))
  return sendSuccess(res, enriched, "Distributor orders fetched")
}

export async function updateDistributorOrder(req: Request, res: Response) {
  const workflow = await OrderWorkflow.findOneAndUpdate(
    { orderId: req.params.id },
    { distributorStatus: req.body.distributorStatus, notes: req.body.notes },
    { new: true, upsert: true },
  )
  return sendSuccess(res, workflow, "Distributor order updated")
}

export async function listInventoryAllocation(_req: Request, res: Response) {
  const allocations = [
    { sku: "SWIL-PARA-500", allocated: 120, available: 200 },
    { sku: "SWIL-AZI-250", allocated: 50, available: 120 },
  ]
  return sendSuccess(res, allocations, "Inventory allocation fetched")
}

export async function listSettlements(_req: Request, res: Response) {
  return sendSuccess(res, getMockSettlements(), "Settlements fetched")
}
