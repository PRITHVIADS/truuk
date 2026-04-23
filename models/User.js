import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "advertiser", "affiliate"], default: "affiliate" },
  company: { type: String, trim: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
  status: { type: String, enum: ["Active", "Pending", "Inactive", "Rejected"], default: "Pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  lastLogin: { type: Date },
  // Affiliate specific
  paymentMethod: { type: String, enum: ["Bank Transfer", "UPI", "PayPal", "Crypto", "Cheque"] },
  paymentDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    paypalEmail: String,
  },
  totalEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  referralCode: { type: String },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
