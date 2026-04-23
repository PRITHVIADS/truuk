import mongoose from "mongoose";

const PayoutSchema = new mongoose.Schema({
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Processing", "Paid", "Rejected"], default: "Pending" },
  method: { type: String },
  period: { type: String },
  transactionId: { type: String },
  notes: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  processedAt: { type: Date },
  conversions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversion" }],
}, { timestamps: true });

export default mongoose.models.Payout || mongoose.model("Payout", PayoutSchema);
