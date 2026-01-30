import { Request, Response } from "express"
import PaymentIntent from "../models/PaymentIntent"
import { sendSuccess } from "../utils/response"
import { logComplianceEvent } from "../services/complianceService"

export async function createPaymentIntent(req: Request, res: Response) {
  const token = `tok_${Math.random().toString(36).slice(2)}`
  const intent = await PaymentIntent.create({
    userId: req.user?.id,
    orderId: req.body.orderId,
    amount: req.body.amount,
    currency: req.body.currency || "INR",
    token,
    metadata: req.body.metadata,
  })
  await logComplianceEvent({
    actorId: req.user?.id,
    action: "PAYMENT_INTENT_CREATED",
    subjectType: "PaymentIntent",
    subjectId: intent._id.toString(),
  })
  return sendSuccess(res, intent, "Payment intent created")
}

export async function paymentWebhook(req: Request, res: Response) {
  const { token, status } = req.body
  const intent = await PaymentIntent.findOneAndUpdate({ token }, { status }, { new: true })
  return sendSuccess(res, intent, "Payment webhook received")
}

export async function listPaymentIntents(_req: Request, res: Response) {
  const intents = await PaymentIntent.find().sort({ createdAt: -1 })
  return sendSuccess(res, intents, "Payments fetched")
}
