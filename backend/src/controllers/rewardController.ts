import { Request, Response } from "express"
import RewardCatalog from "../models/RewardCatalog"
import LoyaltyLedger from "../models/LoyaltyLedger"
import { sendSuccess } from "../utils/response"

export async function listRewards(_req: Request, res: Response) {
  const items = await RewardCatalog.find({ active: true }).sort({ createdAt: -1 })
  return sendSuccess(res, items, "Rewards fetched")
}

export async function createReward(req: Request, res: Response) {
  const reward = await RewardCatalog.create(req.body)
  return sendSuccess(res, reward, "Reward created")
}

export async function redeemReward(req: Request, res: Response) {
  const reward = await RewardCatalog.findById(req.params.id)
  if (!reward) {
    return sendSuccess(res, null, "Reward not found")
  }
  if (reward.pointsCost > 0) {
    await LoyaltyLedger.create({
      userId: req.user?.id,
      points: reward.pointsCost,
      type: "REDEEM",
      source: `REWARD:${reward.name}`,
    })
  }
  return sendSuccess(res, { reward }, "Reward redeemed")
}

export async function scratchCard(req: Request, res: Response) {
  const reward = await RewardCatalog.findOne({ type: "SCRATCH_CARD", active: true })
  const points = Math.floor(Math.random() * 50) + 10
  await LoyaltyLedger.create({
    userId: req.user?.id,
    points,
    type: "EARN",
    source: "SCRATCH_CARD",
  })
  return sendSuccess(res, { reward, points }, "Scratch card redeemed")
}

export async function makeWish(req: Request, res: Response) {
  const points = Math.floor(Math.random() * 100) + 50
  await LoyaltyLedger.create({
    userId: req.user?.id,
    points,
    type: "EARN",
    source: "MAKE_A_WISH",
    metadata: { wish: req.body.wish },
  })
  return sendSuccess(res, { points }, "Wish submitted")
}
