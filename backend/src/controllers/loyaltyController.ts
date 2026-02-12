import { Request, Response } from "express"
import LoyaltyLedger from "../models/LoyaltyLedger"
import { sendSuccess } from "../utils/response"

function resolveTier(points: number) {
  if (points >= 1000) return "GOLD"
  if (points >= 500) return "SILVER"
  return "BRONZE"
}

export async function getLoyaltySummary(req: Request, res: Response) {
  const ledger = await LoyaltyLedger.find({ userId: req.user?.id }).sort({ createdAt: -1 })
  const points = ledger.reduce(
    (sum, entry) => sum + (entry.type === "REDEEM" ? -entry.points : entry.points),
    0,
  )
  const tier = resolveTier(points)
  return sendSuccess(res, { points, tier, ledger }, "Loyalty summary fetched")
}

export async function earnPoints(req: Request, res: Response) {
  const entry = await LoyaltyLedger.create({
    userId: req.user?.id,
    points: req.body.points,
    type: "EARN",
    source: req.body.source || "ORDER",
    tier: resolveTier(req.body.points || 0),
  })
  return sendSuccess(res, entry, "Points awarded")
}

export async function redeemPoints(req: Request, res: Response) {
  const pointsToRedeem = req.body.points
  if (!pointsToRedeem || pointsToRedeem < 1) {
    return res.status(400).json({ success: false, error: "Points must be at least 1" })
  }
  const ledger = await LoyaltyLedger.find({ userId: req.user?.id }).sort({ createdAt: -1 })
  const balance = ledger.reduce(
    (sum, entry) => sum + (entry.type === "REDEEM" ? -entry.points : entry.points),
    0,
  )
  if (pointsToRedeem > balance) {
    return res.status(400).json({ success: false, error: "Insufficient points balance" })
  }
  const entry = await LoyaltyLedger.create({
    userId: req.user?.id,
    points: pointsToRedeem,
    type: "REDEEM",
    source: req.body.source || "REWARD",
    tier: resolveTier(pointsToRedeem),
  })
  return sendSuccess(res, entry, "Points redeemed")
}
