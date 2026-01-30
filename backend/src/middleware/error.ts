import { NextFunction, Request, Response } from "express"

export class AppError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err instanceof AppError ? err.status : 500
  const message = err instanceof Error ? err.message : "Server error"
  res.status(status).json({ success: false, error: message })
}
