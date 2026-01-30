import { NextFunction, Request, Response } from "express"
import FeatureFlag from "../models/FeatureFlag"
import { sendError } from "../utils/response"

export function requireFeatureFlag(flag: "RETURNS_ENABLED" | "COUPONS_ENABLED") {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const doc = await FeatureFlag.findOne({ key: flag })
    if (!doc || !doc.enabled) {
      return sendError(res, `${flag} is disabled`, 403)
    }
    next()
  }
}
