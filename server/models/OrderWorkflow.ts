import mongoose from "mongoose"

const orderWorkflowSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    distributorStatus: {
      type: String,
      enum: ["PENDING_APPROVAL", "APPROVED", "CONSOLIDATED", "ALLOCATED", "SHIPPED"],
      default: "PENDING_APPROVAL",
    },
    notes: { type: String },
  },
  { timestamps: true },
)

export default mongoose.models.OrderWorkflow ||
  mongoose.model("OrderWorkflow", orderWorkflowSchema)
