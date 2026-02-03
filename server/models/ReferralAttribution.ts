import mongoose from "mongoose"

const referralAttributionSchema = new mongoose.Schema(
  {
    refCode: { type: String, required: true },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true },
)

export default mongoose.models.ReferralAttribution ||
  mongoose.model("ReferralAttribution", referralAttributionSchema)
