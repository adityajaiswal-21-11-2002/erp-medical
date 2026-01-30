import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genericName: { type: String, required: true },
    packaging: { type: String, required: true },
    dosageForm: {
      type: String, // free-text dosage form
      required: true,
    },
    category: { type: String, required: true },
    pts: { type: Number, required: true },
    ptr: { type: Number, required: true },
    netMrp: { type: Number, required: true },
    mrp: { type: Number, required: true },
    gstPercent: {
      type: Number,
      enum: [0, 5, 12],
      default: 5,
      required: true,
    },
    hsnCode: { type: String, required: true },
    shelfLife: { type: String, required: true }, // MM/YYYY
    currentStock: { type: Number, required: true },
    // Legacy fields kept optional for existing data
    strength: String,
    manufacturerName: String,
    batch: String,
    manufacturingDate: String,
    expiryDate: String,
    drugLicenseNumber: String,
    scheduleType: {
      type: String,
      enum: ["NON", "H", "H1", "X"],
      default: "NON",
    },
    packType: String,
    unitsPerPack: Number,
    freeQuantity: { type: Number, default: 0 },
    sellingRate: Number,
    discountPercent: { type: Number, default: 0 },
    discountValue: Number,
    cgst: Number,
    sgst: Number,
    taxableValue: Number,
    totalGstAmount: Number,
    openingStock: Number,
    minimumStockAlert: { type: Number, default: 0 },
    stockUnit: {
      type: String,
      enum: ["Strip", "Box", "Bottle"],
      default: "Strip",
    },
    stockStatus: {
      type: String,
      enum: ["IN_STOCK", "LOW", "OUT"],
      default: "IN_STOCK",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    // Base64-encoded product photo (data URL or raw base64 string)
    photoBase64: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
)

export default mongoose.models.Product || mongoose.model("Product", productSchema)
