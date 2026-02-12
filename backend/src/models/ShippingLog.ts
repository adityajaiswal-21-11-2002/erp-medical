import mongoose from "mongoose"

const shippingLogSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    provider: { type: String, required: true },
    action: {
      type: String,
      enum: ["AUTH", "CREATE_ORDER", "ASSIGN", "AWB", "TRACK", "CANCEL", "WEBHOOK"],
      required: true,
    },
    request: { type: mongoose.Schema.Types.Mixed },
    response: { type: mongoose.Schema.Types.Mixed },
    error: { type: String },
    statusCode: { type: Number },
    attempt: { type: Number, default: 1 },
  },
  { timestamps: true },
)

export default (mongoose.models as any)?.ShippingLog || mongoose.model("ShippingLog", shippingLogSchema)
