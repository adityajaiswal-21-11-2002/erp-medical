import { Request, Response } from "express"
import FeatureFlag from "../models/FeatureFlag"
import { sendSuccess } from "../utils/response"
import { logComplianceEvent } from "../services/complianceService"

export async function listFlags(_req: Request, res: Response) {
  const flags = await FeatureFlag.find()
  return sendSuccess(res, flags, "Feature flags fetched")
}

export async function updateFlag(req: Request, res: Response) {
  const { key } = req.params
  const { enabled } = req.body
  const flag = await FeatureFlag.findOneAndUpdate(
    { key },
    { enabled, updatedBy: req.user?.id },
    { upsert: true, new: true },
  )
  await logComplianceEvent({
    actorId: req.user?.id,
    action: "FEATURE_FLAG_UPDATED",
    subjectType: "FeatureFlag",
    subjectId: flag._id.toString(),
    metadata: { key, enabled },
  })
  return sendSuccess(res, flag, "Feature flag updated")
}
