import mongoose from "mongoose"

const shipmentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    provider: { type: String, enum: ["SHIPROCKET", "RAPIDSHYP"], required: true },
    providerOrderId: { type: String },
    shipmentId: { type: String },
    awb: { type: String },
    courierName: { type: String },
    status: {
      type: String,
      enum: [
        "CREATED",
        "AWB_ASSIGNED",
        "READY_TO_PICK",
        "PICKED",
        "IN_TRANSIT",
        "DELIVERED",
        "RTO",
        "CANCELLED",
        "FAILED",
      ],
      default: "CREATED",
    },
    tracking: { type: mongoose.Schema.Types.Mixed },
    raw: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
)

export default (mongoose.models as any)?.Shipment || mongoose.model("Shipment", shipmentSchema)
