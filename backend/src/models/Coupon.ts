import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true },
    description: { type: String },
    discountPercent: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema)
