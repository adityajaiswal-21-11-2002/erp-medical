import mongoose from "mongoose"

const consentSchema = new mongoose.Schema(
  {
    dpdpAccepted: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    ipAddress: { type: String },
    source: { type: String },
  },
  { _id: false },
)

const accountProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    accountType: {
      type: String,
      enum: ["ADMIN", "RETAILER", "DISTRIBUTOR", "CUSTOMER"],
      required: true,
    },
    kycStatus: {
      type: String,
      enum: ["NOT_STARTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_STARTED",
    },
    distributorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    consent: { type: consentSchema, default: () => ({}) },
    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
  },
  { timestamps: true },
)

export default mongoose.models.AccountProfile ||
  mongoose.model("AccountProfile", accountProfileSchema)
