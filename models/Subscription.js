import mongoose from "mongoose";

const PLANS = {
  trial:      { name: "Free Trial",  price: 0,     clicks: 50000,     duration: 14 },
  starter:    { name: "Starter",     price: 1500,   clicks: 1000000,   duration: 30 },  // 10 lakh
  growth:     { name: "Growth",      price: 5000,   clicks: 10000000,  duration: 30 },  // 1 crore
  enterprise: { name: "Enterprise",  price: 0,      clicks: 999999999, duration: 30 },
};

const SubscriptionSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  plan: { type: String, enum: ["trial","starter","growth","enterprise"], required: true },
  status: { type: String, enum: ["active","expired","suspended","cancelled","pending_payment"], default: "active" },
  // Dates
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  trialEndsAt: { type: Date },
  // Payment
  amount: { type: Number, default: 0 }, // in paise for Razorpay
  amountINR: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },
  // Razorpay
  razorpaySubscriptionId: { type: String },
  razorpayCustomerId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  // History
  renewedAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
  // Limits (hidden from users)
  clickLimit: { type: Number, default: 50000 },
  // Invoices
  invoices: [{
    invoiceId: String,
    amount: Number,
    paidAt: Date,
    razorpayPaymentId: String,
  }],
}, { timestamps: true });

SubscriptionSchema.statics.PLANS = PLANS;

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
