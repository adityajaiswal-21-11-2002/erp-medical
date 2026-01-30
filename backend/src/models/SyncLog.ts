import mongoose from "mongoose"

const syncLogSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: ["PRODUCTS", "INVENTORY", "ORDERS", "INVOICES", "SHIPMENTS"],
      required: true,
    },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING"], default: "PENDING" },
    message: { type: String },
    payload: { type: Object },
    retryCount: { type: Number, default: 0 },
    nextRetryAt: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.models.SyncLog || mongoose.model("SyncLog", syncLogSchema)
