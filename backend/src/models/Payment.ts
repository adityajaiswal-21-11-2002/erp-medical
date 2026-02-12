import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    provider: { type: String, enum: ["RAZORPAY"], default: "RAZORPAY" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["CREATED", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED"],
      default: "CREATED",
    },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
)

export default (mongoose.models && (mongoose.models as any).Payment) || mongoose.model("Payment", paymentSchema)
