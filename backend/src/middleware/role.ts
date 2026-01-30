import { NextFunction, Request, Response } from "express"
import { sendError } from "../utils/response"

export function requireRole(role: "ADMIN" | "USER") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401)
    }
    if (req.user.role !== role) {
      return sendError(res, "Forbidden", 403)
    }
    next()
  }
}
