import mongoose from "mongoose"

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    accountType: { type: String },
    eventType: {
      type: String,
      enum: ["page_view", "search", "add_to_cart", "checkout", "order_placed", "login"],
      required: true,
    },
    metadata: { type: Object },
  },
  { timestamps: true },
)

export default mongoose.models.AnalyticsEvent ||
  mongoose.model("AnalyticsEvent", analyticsEventSchema)
