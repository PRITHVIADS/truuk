import mongoose from "mongoose";

const ClickSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate" },
  clickId: { type: String, required: true, unique: true },
  ip: { type: String },
  userAgent: { type: String },
  country: { type: String },
  city: { type: String },
  device: { type: String, enum: ["mobile", "desktop", "tablet", "unknown"], default: "unknown" },
  os: { type: String },
  browser: { type: String },
  sub1: { type: String },
  sub2: { type: String },
  sub3: { type: String },
  referer: { type: String },
  converted: { type: Boolean, default: false },
  conversionId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversion" },
  isBot: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
}, { timestamps: true });

ClickSchema.index({ campaignId: 1, createdAt: -1 });
ClickSchema.index({ affiliateId: 1, createdAt: -1 });
ClickSchema.index({ clickId: 1 });

export default mongoose.models.Click || mongoose.model("Click", ClickSchema);
