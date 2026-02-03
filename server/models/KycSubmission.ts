import mongoose from "mongoose"

const documentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String },
    filePath: { type: String },
    base64: { type: String },
    metadata: { type: Object },
  },
  { _id: false },
)

const kycSubmissionSchema = new mongoose.Schema(
  {
    retailerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "RESUBMIT"],
      default: "PENDING",
    },
    documents: { type: [documentSchema], default: [] },
    businessName: { type: String, required: true },
    gstin: { type: String },
    drugLicenseNumber: { type: String },
    address: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export default mongoose.models.KycSubmission || mongoose.model("KycSubmission", kycSubmissionSchema)
