import mongoose from "mongoose"

const bannerAssetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    base64: { type: String },
    placement: { type: String, enum: ["ADMIN", "RETAILER", "CUSTOMER"], default: "CUSTOMER" },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export default mongoose.models.BannerAsset || mongoose.model("BannerAsset", bannerAssetSchema)
