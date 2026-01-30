import { NextFunction, Request, Response } from "express"
import { sendError } from "../utils/response"

export function requireAccountType(...types: Array<"ADMIN" | "RETAILER" | "DISTRIBUTOR" | "CUSTOMER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.accountType || !types.includes(req.user.accountType)) {
      return sendError(res, "Forbidden", 403)
    }
    next()
  }
}
