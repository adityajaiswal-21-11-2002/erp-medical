import mongoose from "mongoose"

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["REQUESTED", "APPROVED", "REJECTED"], default: "REQUESTED" },
    notes: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.ReturnRequest ||
  mongoose.model("ReturnRequest", returnRequestSchema)
