import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  website: { type: String },
  logo: { type: String },
  // Owner
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ownerName: { type: String },
  ownerEmail: { type: String },
  // Status
  status: { type: String, enum: ["Active","Pending","Suspended","Cancelled"], default: "Pending" },
  // Plan
  plan: { type: String, enum: ["trial","starter","growth","enterprise"], default: "trial" },
  // Usage tracking
  clicksThisMonth: { type: Number, default: 0 },
  clicksResetAt: { type: Date, default: Date.now },
  totalClicks: { type: Number, default: 0 },
  totalConversions: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  // Counts
  campaignCount: { type: Number, default: 0 },
  publisherCount: { type: Number, default: 0 },
  advertiserCount: { type: Number, default: 0 },
  // Meta
  notes: { type: String },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  suspendedAt: { type: Date },
  suspendReason: { type: String },
}, { timestamps: true });

// Generate slug from name
OrganizationSchema.pre("save", function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 50);
  }
  next();
});

export default mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
