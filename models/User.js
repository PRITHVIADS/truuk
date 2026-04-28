import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "advertiser", "affiliate"], default: "affiliate" },
  status: { type: String, enum: ["Active", "Pending", "Inactive", "Rejected"], default: "Pending" },
  // Short unique IDs for use in macros
  shortId: { type: String, unique: true, sparse: true }, // e.g. ADVA1B2C3 or PUBX1Y2Z3
  // Profile
  company: { type: String },
  phone: { type: String },
  website: { type: String },
  address: { type: String },
  // Advertiser specific
  advertiserRef: { type: String }, // shown in UI as "Advertiser ID"
  // Affiliate specific
  publisherRef: { type: String },  // shown in UI as "Publisher ID"
  referralCode: { type: String, unique: true, sparse: true },
  // Payment
  paymentMethod: { type: String, default: "Bank Transfer" },
  paymentDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    paypalEmail: String,
  },
  // Stats
  totalEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  // Postback
  postbackUrl: { type: String },
  notes: { type: String },
  // Multi-tenant
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  isSuperAdmin: { type: Boolean, default: false }, // Your account only,
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  isSuperAdmin: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

UserSchema.methods.comparePassword = async function(pass) {
  return bcrypt.compare(pass, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
