import { Request, Response } from "express"
import SyncLog from "../models/SyncLog"
import { sendSuccess } from "../utils/response"
import { getMockInventory, getMockInvoices, getMockProducts } from "../services/erpService"

export async function syncProducts(_req: Request, res: Response) {
  const payload = getMockProducts()
  const log = await SyncLog.create({
    jobType: "PRODUCTS",
    status: "SUCCESS",
    payload,
    message: "Mock product sync completed",
  })
  return sendSuccess(res, { payload, log }, "ERP products synced")
}

export async function syncInventory(_req: Request, res: Response) {
  const payload = getMockInventory()
  const log = await SyncLog.create({
    jobType: "INVENTORY",
    status: "SUCCESS",
    payload,
    message: "Mock inventory sync completed",
  })
  return sendSuccess(res, { payload, log }, "ERP inventory synced")
}

export async function pushOrders(req: Request, res: Response) {
  const log = await SyncLog.create({
    jobType: "ORDERS",
    status: "PENDING",
    payload: req.body,
    message: "Mock order pushed to ERP",
  })
  return sendSuccess(res, log, "ERP order queued")
}

export async function invoiceCallback(req: Request, res: Response) {
  const log = await SyncLog.create({
    jobType: "INVOICES",
    status: "SUCCESS",
    payload: req.body,
    message: "Invoice callback received",
  })
  return sendSuccess(res, log, "Invoice callback handled")
}

export async function shipmentStatus(req: Request, res: Response) {
  const log = await SyncLog.create({
    jobType: "SHIPMENTS",
    status: "SUCCESS",
    payload: req.body,
    message: "Shipment status updated",
  })
  return sendSuccess(res, log, "Shipment status updated")
}

export async function listInvoices(_req: Request, res: Response) {
  return sendSuccess(res, getMockInvoices(), "Mock invoices fetched")
}
