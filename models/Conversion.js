import mongoose from "mongoose";

const ConversionSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate" },
  clickId: { type: mongoose.Schema.Types.ObjectId, ref: "Click" },
  transactionId: { type: String },
  payout: { type: Number, required: true },
  saleAmount: { type: Number, default: 0 }, // for Sale objective
  objective: { type: String, default: "Conversions" },
  status: { type: String, enum: ["Pending","Approved","Rejected","Paid"], default: "Pending" },
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

export default mongoose.models.Conversion || mongoose.model("Conversion", ConversionSchema);
