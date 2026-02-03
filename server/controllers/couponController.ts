import { Request, Response } from "express"
import Coupon from "../models/Coupon"
import { sendSuccess } from "../utils/response"

export async function listCoupons(_req: Request, res: Response) {
  const coupons = await Coupon.find({ active: true }).sort({ createdAt: -1 })
  return sendSuccess(res, coupons, "Coupons fetched")
}

export async function createCoupon(req: Request, res: Response) {
  const coupon = await Coupon.create(req.body)
  return sendSuccess(res, coupon, "Coupon created")
}
