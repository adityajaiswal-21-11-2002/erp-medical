import { Response } from "express"

export function sendSuccess(res: Response, data: unknown, message = "OK") {
  return res.json({ success: true, data, message })
}

export function sendError(res: Response, error: string, status = 400) {
  return res.status(status).json({ success: false, error })
}
