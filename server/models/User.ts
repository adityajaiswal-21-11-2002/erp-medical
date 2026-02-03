import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["ACTIVE", "BLOCKED"], default: "ACTIVE" },
    // Base64-encoded user photo (avatar)
    photoBase64: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: Date,
  },
  { timestamps: true },
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return
  }
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model("User", userSchema)
