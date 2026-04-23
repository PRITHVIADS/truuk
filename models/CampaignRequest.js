import mongoose from "mongoose";
const CampaignRequestSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Pending","Approved","Rejected"], default: "Pending" },
  message: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });
CampaignRequestSchema.index({ campaignId: 1, affiliateId: 1 }, { unique: true });
export default mongoose.models.CampaignRequest || mongoose.model("CampaignRequest", CampaignRequestSchema);
