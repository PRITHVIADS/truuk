import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate" },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: "Click" },
  transactionId: { type: String },
  payout: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected", "Paid"], default: "Pending" },
  type: { type: String },
  ip: { type: String },
  country: { type: String },
  device: { type: String },
  sub1: { type: String },
  sub2: { type: String },
  notes: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

ConversionSchema.index({ campaignId: 1, createdAt: -1 });
ConversionSchema.index({ affiliateId: 1, createdAt: -1 });

export default mongoose.models.Conversion || mongoose.model("Conversion", ConversionSchema);
