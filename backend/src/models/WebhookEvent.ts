import mongoose from "mongoose"

const webhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["RAZORPAY", "SHIPROCKET", "RAPIDSHYP"],
      required: true,
    },
    eventId: { type: String, required: true, unique: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    processedAt: { type: Date },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: { type: String },
  },
  { timestamps: true },
)

webhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true })

export default (mongoose.models && (mongoose.models as any).WebhookEvent) || mongoose.model("WebhookEvent", webhookEventSchema)
