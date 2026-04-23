import mongoose from "mongoose";

const AffiliateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  website: { type: String, trim: true },
  status: { type: String, enum: ["Active", "Inactive", "Pending", "Banned"], default: "Pending" },
  paymentMethod: { type: String, enum: ["Bank Transfer", "UPI", "PayPal", "Crypto", "Cheque"], default: "Bank Transfer" },
  paymentDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    paypalEmail: String,
  },
  campaigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }],
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  postbackUrl: { type: String },
  notes: { type: String },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Affiliate || mongoose.model("Affiliate", AffiliateSchema);
