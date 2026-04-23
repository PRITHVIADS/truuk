import mongoose from "mongoose";

const ClickSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: "Affiliate" },
  clickId: { type: String, required: true, unique: true },
  // Traffic info
  ip: { type: String },
  userAgent: { type: String },
  device: { type: String, enum: ["mobile","desktop","tablet","unknown"], default: "unknown" },
  os: { type: String },
  osVersion: { type: String },
  country: { type: String },
  city: { type: String },
  region: { type: String },
  isp: { type: String },
  connType: { type: String },
  deviceLang: { type: String },
  referer: { type: String },
  // Mobile IDs
  gaid: { type: String },
  idfa: { type: String },
  androidId: { type: String },
  fbclid: { type: String },
  gclid: { type: String },
  // App
  appId: { type: String },
  appName: { type: String },
  // Source tracking
  source: { type: String },
  subSource: { type: String },
  // Custom params p1-p15
  p1: { type: String }, p2: { type: String }, p3: { type: String },
  p4: { type: String }, p5: { type: String }, p6: { type: String },
  p7: { type: String }, p8: { type: String }, p9: { type: String },
  p10: { type: String }, p11: { type: String }, p12: { type: String },
  p13: { type: String }, p14: { type: String }, p15: { type: String },
  // Sub params
  sub1: { type: String }, sub2: { type: String }, sub3: { type: String },
  sub4: { type: String }, sub5: { type: String }, sub6: { type: String },
  sub7: { type: String }, sub8: { type: String }, sub9: { type: String },
  sub10: { type: String },
  // Status
  isBot: { type: Boolean, default: false },
  isDuplicate: { type: Boolean, default: false },
  converted: { type: Boolean, default: false },
  conversionId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversion" },
}, { timestamps: true });

ClickSchema.index({ campaignId: 1, createdAt: -1 });
ClickSchema.index({ affiliateId: 1, createdAt: -1 });
ClickSchema.index({ clickId: 1 }, { unique: true });
ClickSchema.index({ ip: 1, campaignId: 1, createdAt: -1 });

export default mongoose.models.Click || mongoose.model("Click", ClickSchema);
