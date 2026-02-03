import mongoose from "mongoose"

const rewardCatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["SCRATCH_CARD", "MAGIC_STORE"], required: true },
    pointsCost: { type: Number, default: 0 },
    rules: { type: String },
    active: { type: Boolean, default: true },
    metadata: { type: Object },
  },
  { timestamps: true },
)

export default mongoose.models.RewardCatalog ||
  mongoose.model("RewardCatalog", rewardCatalogSchema)
