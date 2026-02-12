import ShippingLogModel from "../../models/ShippingLog"
import mongoose from "mongoose"

export async function logShippingAction(params: {
  orderId?: mongoose.Types.ObjectId
  provider: string
  action: "AUTH" | "CREATE_ORDER" | "ASSIGN" | "AWB" | "TRACK" | "CANCEL" | "WEBHOOK"
  request?: Record<string, unknown>
  response?: Record<string, unknown>
  error?: string
  statusCode?: number
  attempt?: number
}) {
  const safeRequest = params.request ? sanitizeForLog(params.request) : undefined
  const safeResponse = params.response ? sanitizeForLog(params.response) : undefined
  await ShippingLogModel.create({
    orderId: params.orderId,
    provider: params.provider,
    action: params.action,
    request: safeRequest,
    response: safeResponse,
    error: params.error,
    statusCode: params.statusCode,
    attempt: params.attempt ?? 1,
  })
}

function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const omit = ["password", "token", "secret", "authorization", "api_key", "apiKey"]
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase()
    if (omit.some((o) => keyLower.includes(o))) continue
    if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = sanitizeForLog(v as Record<string, unknown>)
    } else {
      out[k] = v
    }
  }
  return out
}
