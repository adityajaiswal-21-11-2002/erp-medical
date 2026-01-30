import mongoose from "mongoose"

const complianceLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    subjectType: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: Object },
  },
  { timestamps: true },
)

export default mongoose.models.ComplianceLog ||
  mongoose.model("ComplianceLog", complianceLogSchema)
