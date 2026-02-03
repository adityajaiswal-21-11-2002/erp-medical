import mongoose from "mongoose"

const paymentIntentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    token: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    provider: { type: String, default: "MOCK_ROUTER" },
    metadata: { type: Object },
  },
  { timestamps: true },
)

export default mongoose.models.PaymentIntent ||
  mongoose.model("PaymentIntent", paymentIntentSchema)
