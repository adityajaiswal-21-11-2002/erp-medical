import { Request, Response } from "express"
import ComplianceLog from "../models/ComplianceLog"
import { sendSuccess } from "../utils/response"

export async function listComplianceLogs(_req: Request, res: Response) {
  const logs = await ComplianceLog.find().sort({ createdAt: -1 })
  return sendSuccess(res, logs, "Compliance logs fetched")
}
