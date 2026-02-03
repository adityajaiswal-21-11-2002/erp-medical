import mongoose from "mongoose"

const loyaltyLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ["EARN", "REDEEM", "ADJUST"], required: true },
    source: { type: String },
    tier: { type: String, enum: ["BRONZE", "SILVER", "GOLD"], default: "BRONZE" },
    metadata: { type: Object },
  },
  { timestamps: true },
)

export default mongoose.models.LoyaltyLedger ||
  mongoose.model("LoyaltyLedger", loyaltyLedgerSchema)
