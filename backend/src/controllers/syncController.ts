import { Request, Response } from "express"
import SyncLog from "../models/SyncLog"
import { sendSuccess } from "../utils/response"

export async function listSyncLogs(_req: Request, res: Response) {
  const logs = await SyncLog.find().sort({ createdAt: -1 })
  return sendSuccess(res, logs, "Sync logs fetched")
}

export async function retrySync(req: Request, res: Response) {
  const log = await SyncLog.findByIdAndUpdate(
    req.params.id,
    { status: "PENDING", retryCount: { $inc: 1 }, nextRetryAt: new Date() },
    { new: true },
  )
  return sendSuccess(res, log, "Sync retry queued")
}
