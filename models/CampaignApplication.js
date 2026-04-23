import mongoose from "mongoose";

const CampaignApplicationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate", required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  message: { type: String }, // affiliate's message when requesting
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

CampaignApplicationSchema.index({ campaignId: 1, affiliateId: 1 }, { unique: true });

export default mongoose.models.CampaignApplication || mongoose.model("CampaignApplication", CampaignApplicationSchema);
