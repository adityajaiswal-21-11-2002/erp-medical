import { NextFunction, Request, Response } from "express"
import User from "../models/User"
import AccountProfile from "../models/AccountProfile"
import { verifyAccessToken } from "../utils/token"
import { sendError } from "../utils/response"

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : ""
    if (!token) {
      return sendError(res, "Unauthorized", 401)
    }
    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.userId)
    if (!user) {
      return sendError(res, "Unauthorized", 401)
    }
    if (user.status === "BLOCKED") {
      return sendError(res, "User is blocked", 403)
    }
    const profile = await AccountProfile.findOne({ userId: user._id })
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
      status: user.status,
      accountType: profile?.accountType,
    }
    return next()
  } catch {
    return sendError(res, "Unauthorized", 401)
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : ""
    if (!token) {
      return next()
    }
    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.userId)
    if (user && user.status !== "BLOCKED") {
      const profile = await AccountProfile.findOne({ userId: user._id })
      req.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
        name: user.name,
        status: user.status,
        accountType: profile?.accountType,
      }
    }
  } catch {
    // ignore invalid token for optional auth
  }
  return next()
}
