import { Request, Response } from "express"
import Referral from "../models/Referral"
import ReferralAttribution from "../models/ReferralAttribution"
import { sendSuccess } from "../utils/response"

function generateRefCode() {
  return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export async function getReferral(req: Request, res: Response) {
  let referral = await Referral.findOne({ retailerId: req.user?.id })
  if (!referral) {
    referral = await Referral.create({
      retailerId: req.user?.id,
      refCode: generateRefCode(),
    })
  }
  return sendSuccess(res, referral, "Referral fetched")
}

export async function trackReferralClick(req: Request, res: Response) {
  const { refCode } = req.body
  const referral = await Referral.findOneAndUpdate(
    { refCode },
    { $inc: { clicks: 1 } },
    { new: true },
  )
  return sendSuccess(res, referral, "Referral click tracked")
}

export async function attributeReferral(req: Request, res: Response) {
  const { refCode, orderId, customerId } = req.body
  const referral = await Referral.findOne({ refCode })
  if (!referral) {
    return sendSuccess(res, null, "Referral not found")
  }
  const existing = await ReferralAttribution.findOne({ orderId })
  if (existing) {
    return sendSuccess(res, referral, "Referral already attributed")
  }
  await ReferralAttribution.create({
    refCode,
    retailerId: referral.retailerId,
    orderId,
    customerId,
  })
  referral.attributedOrders += 1
  await referral.save()
  return sendSuccess(res, referral, "Referral attributed")
}
