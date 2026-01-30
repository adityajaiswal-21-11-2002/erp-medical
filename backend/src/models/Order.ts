import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    customerAddress: { type: String, required: true },
    gstin: String,
    doctorName: String,
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        batch: String,
        expiry: String,
        quantity: { type: Number, required: true },
        freeQuantity: { type: Number, default: 0 },
        mrp: Number,
        rate: Number,
        discount: Number,
        cgst: Number,
        sgst: Number,
        amount: Number,
      },
    ],
    subtotal: Number,
    totalDiscount: Number,
    totalGst: Number,
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PLACED", "CANCELLED", "DELIVERED"],
      default: "PLACED",
    },
    invoiceNumber: String,
  },
  { timestamps: true },
)

export default mongoose.models.Order || mongoose.model("Order", orderSchema)
