import { Request, Response } from "express"
import AccountProfile from "../models/AccountProfile"
import { sendSuccess } from "../utils/response"
import { logComplianceEvent } from "../services/complianceService"

export async function getAccountProfile(req: Request, res: Response) {
  const profile = await AccountProfile.findOne({ userId: req.user?.id })
  return sendSuccess(res, profile, "Account profile fetched")
}

export async function updateConsent(req: Request, res: Response) {
  const profile = await AccountProfile.findOneAndUpdate(
    { userId: req.user?.id },
    { consent: req.body.consent },
    { new: true, upsert: true },
  )
  await logComplianceEvent({
    actorId: req.user?.id,
    action: "CONSENT_UPDATED",
    subjectType: "AccountProfile",
    subjectId: profile._id.toString(),
    metadata: { consent: req.body.consent },
  })
  return sendSuccess(res, profile, "Consent updated")
}
