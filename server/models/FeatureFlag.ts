import mongoose from "mongoose"

const featureFlagSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["RETURNS_ENABLED", "COUPONS_ENABLED"], unique: true },
    enabled: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export default mongoose.models.FeatureFlag || mongoose.model("FeatureFlag", featureFlagSchema)
