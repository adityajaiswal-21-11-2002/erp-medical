import mongoose from "mongoose"

const referralSchema = new mongoose.Schema(
  {
    refCode: { type: String, unique: true, required: true },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clicks: { type: Number, default: 0 },
    attributedOrders: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Referral || mongoose.model("Referral", referralSchema)
