import { Request, Response } from "express"
import ReturnRequest from "../models/ReturnRequest"
import { sendSuccess } from "../utils/response"

export async function listReturns(req: Request, res: Response) {
  const filter: Record<string, unknown> = {}
  if (req.user?.accountType !== "ADMIN") {
    filter.retailerId = req.user?.id
  }
  const returns = await ReturnRequest.find(filter).sort({ createdAt: -1 })
  return sendSuccess(res, returns, "Returns fetched")
}

export async function createReturn(req: Request, res: Response) {
  const record = await ReturnRequest.create({
    orderId: req.body.orderId,
    retailerId: req.user?.id,
    reason: req.body.reason,
    notes: req.body.notes,
  })
  return sendSuccess(res, record, "Return request created")
}

export async function updateReturn(req: Request, res: Response) {
  const record = await ReturnRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })
  return sendSuccess(res, record, "Return request updated")
}
